import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Clock, MapPin, ShoppingBag, CheckCircle, Truck, XCircle, ChefHat, User, Phone, Mail } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

type Order = {
    id: string;
    created_at: string;
    status: string;
    total: number;
    delivery_address: any;
    items: any[];
    driver_id?: string;
    user: {
        full_name: string;
        phone: string;
        email?: string;
    };
    driver?: {
        name: string;
        phone?: string;
    };
};

export default function BusinessOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [businessType, setBusinessType] = useState<string>('restaurant');

    useEffect(() => {
        fetchBusinessAndOrders();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('public:orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                console.log('Realtime update:', payload);
                if (businessId) fetchOrders(businessId);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [businessId]);

    const fetchBusinessAndOrders = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: business } = await supabase
                .from('businesses')
                .select('id, type')
                .eq('owner_id', user.id)
                .single();

            if (business) {
                setBusinessId(business.id);
                setBusinessType(business.type || 'restaurant');
                fetchOrders(business.id);
            }
        } catch (error) {
            console.error("Error fetching business:", error);
        }
    };

    const fetchOrders = async (busId: string) => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          user:profiles(full_name, phone, email),
          driver:drivers(name, phone)
        `)
                .eq('business_id', busId)
                .order('created_at', { ascending: false }); // Newest first

            if (error) {
                console.error("Query error:", error);
                throw error;
            }
            console.log("Orders fetched:", data);
            console.log("First order with driver:", data?.find(o => o.driver_id));
            setOrders(data || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            toast.success(`Pedido actualizado a: ${newStatus}`);
            // Optimistic update
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error: any) {
            toast.error("Error al actualizar: " + error.message);
        }
    };

    const getTerminology = (type: string) => {
        if (type === 'restaurant') {
            return {
                preparing: 'Cocinando',
                icon: ChefHat
            };
        }
        return {
            preparing: 'Preparando',
            icon: ShoppingBag
        };
    };

    const TerminologyIcon = getTerminology(businessType).icon;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500';
            case 'confirmed': return 'bg-blue-500';
            case 'preparing': return 'bg-orange-500';
            case 'ready': return 'bg-green-500';
            case 'picking_up': return 'bg-purple-500';
            case 'in_transit': return 'bg-purple-500';
            case 'delivered': return 'bg-green-700';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            pending: 'Pendiente',
            confirmed: 'Confirmado',
            preparing: getTerminology(businessType).preparing,
            ready: 'Listo',
            picking_up: 'Recogiendo',
            in_transit: 'En camino',
            delivered: 'Entregado',
            cancelled: 'Cancelado',
        };
        return labels[status] || status;
    };

    // Group orders by status for Kanban-like view
    const columns = [
        {
            id: 'new',
            title: 'Nuevos',
            statuses: ['pending', 'confirmed'],
            color: 'border-yellow-200 bg-yellow-50/50'
        },
        {
            id: 'preparing',
            title: getTerminology(businessType).preparing,
            statuses: ['preparing'],
            color: 'border-orange-200 bg-orange-50/50'
        },
        {
            id: 'ready',
            title: 'Listos',
            statuses: ['ready'],
            color: 'border-green-200 bg-green-50/50'
        },
        {
            id: 'in_transit',
            title: 'En Camino',
            statuses: ['picking_up', 'in_transit'],
            color: 'border-purple-200 bg-purple-50/50'
        },
        {
            id: 'completed',
            title: 'Completados',
            statuses: ['delivered', 'cancelled'],
            color: 'border-gray-200 bg-gray-50/50'
        }
    ];

    if (loading) return <div className="p-8">Cargando pedidos...</div>;

    return (
        <div className="h-[calc(100vh-6rem)] overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max h-full">
                {columns.map(column => (
                    <div key={column.id} className={`w-80 flex-shrink-0 flex flex-col rounded-lg border ${column.color} p-4`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg">{column.title}</h3>
                            <Badge variant="secondary">
                                {orders.filter(o => column.statuses.includes(o.status)).length}
                            </Badge>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {orders
                                .filter(order => column.statuses.includes(order.status))
                                .map(order => (
                                    <Card key={order.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                                        <CardHeader className="p-4 pb-2">
                                            <div className="flex justify-between items-start">
                                                <Badge className={`${getStatusColor(order.status)} text-white border-0`}>
                                                    {getStatusLabel(order.status)}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <CardTitle className="text-sm font-medium mt-2">
                                                #{order.id.slice(0, 8)}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-2 space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent hover:text-primary flex items-center gap-2">
                                                            <User className="h-4 w-4" />
                                                            <span className="font-medium underline decoration-dotted underline-offset-4">
                                                                {order.user?.full_name || 'Cliente'}
                                                            </span>
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Información del Cliente</DialogTitle>
                                                            <DialogDescription>Detalles de contacto</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <User className="h-5 w-5 text-muted-foreground" />
                                                                <div>
                                                                    <p className="text-sm font-medium">Nombre</p>
                                                                    <p className="text-sm text-muted-foreground">{order.user?.full_name || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <Phone className="h-5 w-5 text-muted-foreground" />
                                                                <div>
                                                                    <p className="text-sm font-medium">Teléfono</p>
                                                                    <p className="text-sm text-muted-foreground">{order.user?.phone || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <Mail className="h-5 w-5 text-muted-foreground" />
                                                                <div>
                                                                    <p className="text-sm font-medium">Email</p>
                                                                    <p className="text-sm text-muted-foreground">{order.user?.email || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>

                                            <div className="space-y-1">
                                                {order.items?.map((item, i) => (
                                                    <div key={i} className="text-sm flex justify-between">
                                                        <span>{item.quantity}x {item.product.name}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t">
                                                <span className="font-semibold">Total:</span>
                                                <span className="font-bold text-lg">${order.total}</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-4 pt-0 flex gap-2 justify-end">
                                            {order.status === 'pending' && (
                                                <>
                                                    <Button size="sm" variant="destructive" onClick={() => updateStatus(order.id, 'cancelled')}>
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" onClick={() => updateStatus(order.id, 'confirmed')}>
                                                        <CheckCircle className="h-4 w-4 mr-1" /> Confirmar
                                                    </Button>
                                                </>
                                            )}
                                            {order.status === 'confirmed' && (
                                                <Button size="sm" onClick={() => updateStatus(order.id, 'preparing')}>
                                                    <TerminologyIcon className="h-4 w-4 mr-1" /> {getTerminology(businessType).preparing}
                                                </Button>
                                            )}
                                            {order.status === 'preparing' && (
                                                <Button size="sm" onClick={() => updateStatus(order.id, 'ready')}>
                                                    <CheckCircle className="h-4 w-4 mr-1" /> Listo
                                                </Button>
                                            )}
                                            {order.status === 'ready' && (
                                                order.driver_id && order.driver ? (
                                                    <div className="w-full text-center text-xs bg-blue-50 text-blue-700 py-2 rounded flex flex-col gap-1">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Truck className="h-3 w-3" />
                                                            <span className="font-medium">Repartidor asignado</span>
                                                        </div>
                                                        <span className="text-[11px]">{order.driver.name}</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-full text-center text-xs text-muted-foreground bg-gray-100 py-2 rounded flex items-center justify-center gap-2 animate-pulse">
                                                        <Clock className="h-3 w-3" /> Esperando repartidor...
                                                    </div>
                                                )
                                            )}
                                        </CardFooter>
                                    </Card>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
