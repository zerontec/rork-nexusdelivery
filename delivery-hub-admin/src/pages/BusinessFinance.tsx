import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, ShoppingBag, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";

export default function BusinessFinance() {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        averageTicket: 0,
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFinanceData();
    }, []);

    const fetchFinanceData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: business } = await supabase
                .from('businesses')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (!business) return;

            // Fetch orders for the last 7 days
            const startDate = subDays(new Date(), 6); // 7 days including today
            startDate.setHours(0, 0, 0, 0);

            const { data: orders } = await supabase
                .from('orders')
                .select('total, created_at, status')
                .eq('business_id', business.id)
                .neq('status', 'cancelled')
                .gte('created_at', startDate.toISOString())
                .order('created_at', { ascending: true });

            if (!orders) return;

            // Calculate KPIs
            const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0);
            const totalOrders = orders.length;
            const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

            setStats({
                totalSales,
                totalOrders,
                averageTicket
            });

            // Prepare Chart Data
            const dailyData = new Map();

            // Initialize last 7 days with 0
            for (let i = 0; i < 7; i++) {
                const date = subDays(new Date(), 6 - i);
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayName = format(date, 'EEE', { locale: es });
                dailyData.set(dateStr, {
                    date: dateStr,
                    name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
                    ventas: 0,
                    pedidos: 0
                });
            }

            // Fill with actual data
            orders.forEach(order => {
                const dateStr = format(new Date(order.created_at), 'yyyy-MM-dd');
                if (dailyData.has(dateStr)) {
                    const day = dailyData.get(dateStr);
                    day.ventas += Number(order.total);
                    day.pedidos += 1;
                }
            });

            setChartData(Array.from(dailyData.values()));

        } catch (error) {
            console.error("Error fetching finance data:", error);
        } finally {
            setLoading(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border rounded shadow-sm text-xs">
                    <p className="font-bold">{payload[0].payload.name}</p>
                    <p className="text-green-600">Ventas: ${payload[0].value?.toFixed(2)}</p>
                    <p className="text-blue-600">Pedidos: {payload[0].payload.pedidos}</p>
                </div>
            );
        }
        return null;
    };

    if (loading) return <div className="p-8">Cargando reportes...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Reportes Financieros</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventas (7 días)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos (7 días)</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.averageTicket.toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Ventas de la Semana</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="ventas" fill="#16a34a" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
