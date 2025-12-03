import { useEffect, useState } from "react";
import { UserCircle, Truck, Store, Search, Plus, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

export default function Usuarios() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("clientes");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const [driverDocuments, setDriverDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let result;

        if (activeTab === "clientes") {
          const { data: clients } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'client');
          result = clients;
        } else if (activeTab === "repartidores") {
          // Direct query without JOIN to avoid PGRST201 error (ambiguous relationships)
          const { data: drivers } = await supabase
            .from('drivers')
            .select('*');

          // Fetch email from profiles for each driver
          const driversWithEmail = await Promise.all(
            (drivers || []).map(async (d) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('email')
                .eq('id', d.id)
                .single();

              return {
                ...d,
                nombre: d.name,
                telefono: d.phone,
                email: profile?.email
              };
            })
          );

          result = driversWithEmail;
        } else if (activeTab === "negocios") {
          const { data: businesses } = await supabase
            .from('businesses')
            .select('*');

          // Fetch owner email from profiles for each business
          const businessesWithOwnerEmail = await Promise.all(
            (businesses || []).map(async (b) => {
              const { data: ownerProfile } = await supabase
                .from('profiles')
                .select('email')
                .eq('id', b.owner_id)
                .single();

              return {
                ...b,
                ownerEmail: ownerProfile?.email // Email de login del dueño
              };
            })
          );

          result = businessesWithOwnerEmail;
        }

        setData(result || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [activeTab]);

  const filteredData = data.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    const name = item.full_name || item.nombre || item.name || '';
    const email = item.email || '';
    return name.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower);
  });

  const handleViewDetails = async (user: any) => {
    setSelectedUser(user);
    setIsSheetOpen(true);

    if (activeTab === 'repartidores') {
      setLoadingDocs(true);
      try {
        const { data: docs } = await supabase
          .from('driver_documents')
          .select('*')
          .eq('driver_id', user.id);
        setDriverDocuments(docs || []);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoadingDocs(false);
      }
    }
  };

  const handleApproveDocument = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('driver_documents')
        .update({ status: 'approved', rejection_reason: null })
        .eq('id', docId);

      if (error) throw error;

      setDriverDocuments(docs => docs.map(d => d.id === docId ? { ...d, status: 'approved' } : d));
    } catch (error) {
      console.error('Error approving document:', error);
      alert('Error al aprobar documento');
    }
  };

  const handleRejectDocument = async (docId: string) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;

    try {
      const { error } = await supabase
        .from('driver_documents')
        .update({ status: 'rejected', rejection_reason: reason })
        .eq('id', docId);

      if (error) throw error;

      setDriverDocuments(docs => docs.map(d => d.id === docId ? { ...d, status: 'rejected', rejection_reason: reason } : d));
    } catch (error) {
      console.error('Error rejecting document:', error);
      alert('Error al rechazar documento');
    }
  };



  const handleApproveDriver = async (driverId: string) => {
    if (!confirm('¿Estás seguro de aprobar este conductor?')) return;

    setApproving(true);
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_approved: true })
        .eq('id', driverId);

      if (error) throw error;

      // Update local state
      setSelectedUser({ ...selectedUser, is_approved: true });
      setData(data.map(d => d.id === driverId ? { ...d, is_approved: true } : d));

      alert('Conductor aprobado exitosamente');
    } catch (error: any) {
      console.error('Error approving driver:', error);
      alert('Error al aprobar conductor: ' + error.message);
    } finally {
      setApproving(false);
    }
  };

  const handleRejectDriver = async (driverId: string) => {
    if (!confirm('¿Estás seguro de rechazar este conductor? Esta acción no se puede deshacer.')) return;

    setApproving(true);
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);

      if (error) throw error;

      // Close sheet and refresh list
      setIsSheetOpen(false);
      setData(data.filter(d => d.id !== driverId));

      alert('Conductor rechazado y eliminado del sistema');
    } catch (error: any) {
      console.error('Error rejecting driver:', error);
      alert('Error al rechazar conductor: ' + error.message);
    } finally {
      setApproving(false);
    }
  };

  const renderUserDetails = () => {
    if (!selectedUser) return null;

    if (activeTab === "clientes") {
      return (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {(selectedUser.full_name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-semibold">{selectedUser.full_name || 'Sin Nombre'}</h3>
              <p className="text-muted-foreground">{selectedUser.email}</p>
            </div>
            <Badge>Cliente</Badge>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">ID de Usuario</h4>
              <p className="text-sm font-mono bg-muted p-2 rounded">{selectedUser.id}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Teléfono</h4>
              <p className="text-sm">{selectedUser.phone || selectedUser.phone_number || 'No registrado'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Fecha de Registro</h4>
              <p className="text-sm">
                {selectedUser.created_at
                  ? new Date(selectedUser.created_at).toLocaleDateString()
                  : selectedUser.updated_at
                    ? new Date(selectedUser.updated_at).toLocaleDateString()
                    : 'Fecha desconocida'}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "repartidores") {
      return (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {(selectedUser.nombre || 'R').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-semibold">{selectedUser.nombre || 'Sin Nombre'}</h3>
              <p className="text-muted-foreground">{selectedUser.telefono || selectedUser.phone}</p>
            </div>
            <Badge variant={selectedUser.is_active ? "default" : "secondary"}>
              {selectedUser.is_active ? "Activo" : "Inactivo"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">${selectedUser.balance || 0}</div>
                <p className="text-xs text-muted-foreground">Saldo Actual</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">⭐ {selectedUser.rating || 5.0}</div>
                <p className="text-xs text-muted-foreground">Calificación</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Teléfono</h4>
              <p className="text-sm">{selectedUser.telefono || selectedUser.phone || 'No registrado'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
              <p className="text-sm">{selectedUser.email || 'No registrado'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Número de Licencia</h4>
              <p className="text-sm font-mono">{selectedUser.license_number || 'No registrada'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Vehículo</h4>
              <p className="text-sm capitalize">{selectedUser.vehicle_type || 'No especificado'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Estado</h4>
              <p className="text-sm capitalize">{selectedUser.status || 'Desconocido'}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h4 className="text-lg font-semibold mb-4">Documentación</h4>
            {loadingDocs ? (
              <p className="text-sm text-muted-foreground">Cargando documentos...</p>
            ) : driverDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay documentos subidos.</p>
            ) : (
              <div className="space-y-4">
                {driverDocuments.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium capitalize">{doc.document_type.replace('_', ' ')}</p>
                        <Badge variant={doc.status === 'approved' ? 'default' : doc.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {doc.status === 'approved' ? 'Aprobado' : doc.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {doc.status !== 'approved' && (
                          <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => handleApproveDocument(doc.id)}>
                            ✓
                          </Button>
                        )}
                        {doc.status !== 'rejected' && (
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleRejectDocument(doc.id)}>
                            ✕
                          </Button>
                        )}
                      </div>
                    </div>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="block mt-2">
                      <img src={doc.file_url} alt={doc.document_type} className="w-full h-32 object-cover rounded bg-muted" />
                    </a>
                    {doc.rejection_reason && (
                      <p className="text-xs text-red-500 mt-2">Motivo: {doc.rejection_reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t">
            <h4 className="text-lg font-semibold mb-4">Documentación</h4>
            {loadingDocs ? (
              <p className="text-sm text-muted-foreground">Cargando documentos...</p>
            ) : driverDocuments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay documentos subidos.</p>
            ) : (
              <div className="space-y-4">
                {driverDocuments.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium capitalize">{doc.document_type.replace('_', ' ')}</p>
                        <Badge variant={doc.status === 'approved' ? 'default' : doc.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {doc.status === 'approved' ? 'Aprobado' : doc.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {doc.status !== 'approved' && (
                          <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => handleApproveDocument(doc.id)}>
                            ✓
                          </Button>
                        )}
                        {doc.status !== 'rejected' && (
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleRejectDocument(doc.id)}>
                            ✕
                          </Button>
                        )}
                      </div>
                    </div>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="block mt-2">
                      <img src={doc.file_url} alt={doc.document_type} className="w-full h-32 object-cover rounded bg-muted" />
                    </a>
                    {doc.rejection_reason && (
                      <p className="text-xs text-red-500 mt-2">Motivo: {doc.rejection_reason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!selectedUser.is_approved && (
            <div className="mt-6 pt-6 border-t space-y-3">
              <h4 className="text-sm font-semibold text-foreground mb-3">Acciones de Administrador</h4>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleApproveDriver(selectedUser.id)}
                  disabled={approving}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  ✅ Aprobar Conductor
                </Button>
                <Button
                  onClick={() => handleRejectDriver(selectedUser.id)}
                  disabled={approving}
                  variant="destructive"
                  className="flex-1"
                >
                  ❌ Rechazar Solicitud
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Al aprobar, el conductor podrá empezar a aceptar pedidos
              </p>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "negocios") {
      return (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                <Store className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
              <p className="text-muted-foreground">{selectedUser.address}</p>
            </div>
            <Badge variant={selectedUser.is_active ? "default" : "secondary"}>
              {selectedUser.is_active ? "Activo" : "Inactivo"}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Email del Negocio</h4>
              <p className="text-sm">{selectedUser.email || 'No registrado'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Email de Login (Dueño)</h4>
              <p className="text-sm">{selectedUser.ownerEmail || 'No registrado'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Teléfono</h4>
              <p className="text-sm">{selectedUser.phone || 'No registrado'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Dirección</h4>
              <p className="text-sm">{selectedUser.location?.address || 'No registrada'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Tipo</h4>
              <p className="text-sm capitalize">{selectedUser.type || 'General'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h4>
              <p className="text-sm text-muted-foreground">{selectedUser.description || 'Sin descripción'}</p>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">Administra clientes, repartidores y negocios</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Usuario
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar usuarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="clientes" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clientes" className="gap-2">
            <UserCircle className="h-4 w-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="repartidores" className="gap-2">
            <Truck className="h-4 w-4" />
            Repartidores
          </TabsTrigger>
          <TabsTrigger value="negocios" className="gap-2">
            <Store className="h-4 w-4" />
            Negocios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>Todos los usuarios registrados en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center py-4">Cargando...</p>
                ) : filteredData.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No se encontraron clientes</p>
                ) : (
                  filteredData.map((cliente) => (
                    <div key={cliente.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(cliente.full_name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{cliente.full_name || 'Sin Nombre'}</p>
                          <p className="text-sm text-muted-foreground">{cliente.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <Badge variant="default">Activo</Badge>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(cliente)}>Ver detalles</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repartidores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Repartidores</CardTitle>
              <CardDescription>Personal de entrega activo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center py-4">Cargando...</p>
                ) : filteredData.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No se encontraron repartidores</p>
                ) : (
                  filteredData.map((repartidor) => (
                    <div key={repartidor.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(repartidor.nombre || 'R').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{repartidor.nombre || 'Sin Nombre'}</p>
                          <p className="text-sm text-muted-foreground">{repartidor.telefono || 'Sin teléfono'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Saldo: ${repartidor.balance || 0}</p>
                          <p className="text-sm font-medium text-foreground">⭐ {repartidor.rating || 5.0}</p>
                        </div>
                        <Badge variant={repartidor.is_approved ? "default" : "secondary"} className={repartidor.is_approved ? "bg-green-600" : "bg-yellow-600"}>
                          {repartidor.is_approved ? "Aprobado" : "Pendiente"}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(repartidor)}>Ver detalles</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="negocios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Negocios Asociados</CardTitle>
              <CardDescription>Comercios registrados en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center py-4">Cargando...</p>
                ) : filteredData.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">No se encontraron negocios</p>
                ) : (
                  filteredData.map((negocio) => (
                    <div key={negocio.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            <Store className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{negocio.name}</p>
                          <p className="text-sm text-muted-foreground">{negocio.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">Comisión: {negocio.commission_rate || 0}%</p>
                        </div>
                        <Badge variant={negocio.is_active ? "default" : "secondary"}>
                          {negocio.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(negocio)}>Ver detalles</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalles del Usuario</SheetTitle>
            <SheetDescription>
              Información completa del registro
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {renderUserDetails()}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
