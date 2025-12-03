import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Store, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BusinessDashboard() {
    const [stats, setStats] = useState({
        salesToday: 0,
        ordersToday: 0,
        activeOrders: 0,
        isOpen: false
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: business } = await supabase
                .from('businesses')
                .select('id, is_open')
                .eq('owner_id', user.id)
                .single();

            if (!business) return;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Fetch orders for today
            const { data: todayOrders } = await supabase
                .from('orders')
                .select('total, status, created_at')
                .eq('business_id', business.id)
                .gte('created_at', today.toISOString());

            // Fetch active orders (all time)
            const { count: activeCount } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .eq('business_id', business.id)
                .in('status', ['pending', 'preparing', 'ready', 'picking_up', 'in_transit']);

            // Fetch recent orders
            const { data: recent } = await supabase
                .from('orders')
                .select('*, user:profiles(full_name)')
                .eq('business_id', business.id)
                .order('created_at', { ascending: false })
                .limit(5);

            // Calculate stats
            const salesToday = todayOrders?.reduce((sum, order) =>
                order.status !== 'cancelled' ? sum + Number(order.total) : sum, 0) || 0;

            const ordersToday = todayOrders?.length || 0;

            setStats({
                salesToday,
                ordersToday,
                activeOrders: activeCount || 0,
                isOpen: business.is_open || false
            });
            setRecentOrders(recent || []);

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Cargando dashboard...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Panel de Negocio</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.salesToday.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">{stats.ordersToday} pedidos hoy</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Activos</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeOrders}</div>
                        <p className="text-xs text-muted-foreground">En proceso actualmente</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estado</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.isOpen ? 'Abierto' : 'Cerrado'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.isOpen ? 'Recibiendo pedidos' : 'No visible para clientes'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Resumen de Ventas</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-gray-50 rounded-md border border-dashed">
                            <p>Gráfico de ventas (Próximamente)</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Pedidos Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentOrders.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No hay pedidos recientes</p>
                            ) : (
                                recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{order.user?.full_name || 'Cliente'}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                                                {order.status}
                                            </Badge>
                                            <div className="font-bold text-sm">
                                                ${Number(order.total).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
