import { DollarSign, TrendingUp, Calendar, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const comisiones = [
  { negocio: "Restaurante El Sabor", categoria: "Comida", tasa: "15%", totalPedidos: 234, montoBase: 12450, comisionTotal: 1867.50, periodo: "Enero 2024" },
  { negocio: "Farmacia Plus", categoria: "Farmacia", tasa: "12%", totalPedidos: 156, montoBase: 8900, comisionTotal: 1068, periodo: "Enero 2024" },
  { negocio: "SuperMercado Fresh", categoria: "Supermercado", tasa: "10%", totalPedidos: 445, montoBase: 28900, comisionTotal: 2890, periodo: "Enero 2024" },
];

const pagos = [
  { id: "#PAY-001", negocio: "Restaurante El Sabor", monto: 1867.50, estado: "Pagado", fecha: "15 Ene 2024" },
  { id: "#PAY-002", negocio: "Farmacia Plus", monto: 1068, estado: "Pendiente", fecha: "15 Ene 2024" },
  { id: "#PAY-003", negocio: "SuperMercado Fresh", monto: 2890, estado: "Procesando", fecha: "15 Ene 2024" },
];

export default function Comisiones() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Comisiones</h1>
          <p className="text-muted-foreground mt-1">Gestión de comisiones y pagos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Filtrar Período
          </Button>
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            Generar Reporte
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comisiones</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$5,825.50</div>
            <p className="text-xs text-success mt-1">+18.2% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$1,068.00</div>
            <p className="text-xs text-muted-foreground mt-1">3 pagos por procesar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Promedio</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">12.3%</div>
            <p className="text-xs text-muted-foreground mt-1">Entre todos los negocios</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="comisiones" className="space-y-6">
        <TabsList>
          <TabsTrigger value="comisiones">Comisiones</TabsTrigger>
          <TabsTrigger value="pagos">Historial de Pagos</TabsTrigger>
        </TabsList>

        <TabsContent value="comisiones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de Comisiones</CardTitle>
              <CardDescription>Desglose por negocio del período actual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comisiones.map((com, index) => (
                  <div key={index} className="border-b border-border pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{com.negocio}</h3>
                        <p className="text-sm text-muted-foreground">{com.categoria} • {com.periodo}</p>
                      </div>
                      <Badge variant="secondary">{com.tasa}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Pedidos</p>
                        <p className="font-medium text-foreground">{com.totalPedidos}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monto Base</p>
                        <p className="font-medium text-foreground">${com.montoBase.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Comisión</p>
                        <p className="font-medium text-primary">${com.comisionTotal.toFixed(2)}</p>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">Ver Detalle</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pagos</CardTitle>
              <CardDescription>Registro de pagos procesados y pendientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pagos.map((pago) => (
                  <div key={pago.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{pago.id}</p>
                      <p className="text-sm text-muted-foreground">{pago.negocio}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">${pago.monto.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{pago.fecha}</p>
                      </div>
                      <Badge 
                        variant={
                          pago.estado === "Pagado" ? "default" : 
                          pago.estado === "Procesando" ? "secondary" : 
                          "outline"
                        }
                      >
                        {pago.estado}
                      </Badge>
                      <Button variant="ghost" size="sm">Ver</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
