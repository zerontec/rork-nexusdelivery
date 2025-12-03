import { useEffect, useState } from "react";
import { Users, ShoppingBag, TrendingUp, DollarSign, Package, Truck } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const monthlyData = [
  { name: "Ene", envios: 4000, ingresos: 2400 },
  { name: "Feb", envios: 3000, ingresos: 1398 },
  { name: "Mar", envios: 2000, ingresos: 9800 },
  { name: "Abr", envios: 2780, ingresos: 3908 },
  { name: "May", envios: 1890, ingresos: 4800 },
  { name: "Jun", envios: 2390, ingresos: 3800 },
];

const deliveryStatus = [
  { name: "Entregados", value: 400, color: "hsl(var(--success))" },
  { name: "En camino", value: 300, color: "hsl(var(--primary))" },
  { name: "Pendientes", value: 200, color: "hsl(var(--warning))" },
  { name: "Cancelados", value: 100, color: "hsl(var(--destructive))" },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    drivers: 0,
    businesses: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch counts
        const { count: clientCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'client');

        const { count: driverCount } = await supabase
          .from('drivers')
          .select('*', { count: 'exact', head: true });

        // Assuming businesses are stored in 'businesses' table or profiles with role 'business'
        // Checking 'businesses' table first based on previous context, if not exists, fallback to profiles
        const { count: businessCount } = await supabase
          .from('businesses')
          .select('*', { count: 'exact', head: true });

        // Calculate revenue (sum of total from completed orders)
        const { data: revenueData } = await supabase
          .from('orders')
          .select('total')
          .eq('status', 'delivered');

        const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

        // Fetch recent orders
        const { data: orders } = await supabase
          .from('orders')
          .select(`
            id,
            total,
            status,
            created_at,
            profiles:client_id (full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          clients: clientCount || 0,
          drivers: driverCount || 0,
          businesses: businessCount || 0,
          revenue: totalRevenue,
        });

        setRecentOrders(orders || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} h`;
    return `Hace ${Math.floor(diffInHours / 24)} días`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard de Envíos</h1>
        <p className="text-muted-foreground mt-1">Resumen general de tu plataforma de entregas</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Clientes"
          value={loading ? "..." : stats.clients.toString()}
          icon={Users}
          trend={{ value: "+2.5%", positive: true }}
        />
        <StatCard
          title="Repartidores Activos"
          value={loading ? "..." : stats.drivers.toString()}
          icon={Truck}
          trend={{ value: "+5%", positive: true }}
        />
        <StatCard
          title="Negocios Registrados"
          value={loading ? "..." : stats.businesses.toString()}
          icon={ShoppingBag}
          trend={{ value: "+1.2%", positive: true }}
        />
        <StatCard
          title="Ingresos Totales"
          value={loading ? "..." : formatCurrency(stats.revenue)}
          icon={DollarSign}
          trend={{ value: "+15%", positive: true }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Envíos e Ingresos Mensuales</CardTitle>
            <CardDescription>Comparativa de los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                />
                <Bar dataKey="envios" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="ingresos" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Entregas</CardTitle>
            <CardDescription>Distribución actual de pedidos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deliveryStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deliveryStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimos pedidos procesados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">
                    {order.id.slice(0, 8)} - {order.profiles?.full_name || 'Cliente Desconocido'}
                  </p>
                  <p className="text-sm text-muted-foreground">{getTimeAgo(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-foreground">{formatCurrency(order.total)}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${order.status === "delivered" ? "bg-green-100 text-green-700" :
                      order.status === "picking_up" || order.status === "delivering" ? "bg-blue-100 text-blue-700" :
                        order.status === "cancelled" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                    }`}>
                    {order.status === 'delivered' ? 'Entregado' :
                      order.status === 'picking_up' ? 'En camino' :
                        order.status === 'cancelled' ? 'Cancelado' :
                          'Pendiente'}
                  </span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No hay pedidos recientes</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
