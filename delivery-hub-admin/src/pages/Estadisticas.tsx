import { TrendingUp, Clock, MapPin, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const deliveryTimes = [
  { hora: "8-10", entregas: 45 },
  { hora: "10-12", entregas: 89 },
  { hora: "12-14", entregas: 134 },
  { hora: "14-16", entregas: 98 },
  { hora: "16-18", entregas: 112 },
  { hora: "18-20", entregas: 167 },
  { hora: "20-22", entregas: 145 },
];

const weeklyTrend = [
  { dia: "Lun", pedidos: 240, ingresos: 4800 },
  { dia: "Mar", pedidos: 189, ingresos: 3780 },
  { dia: "Mié", pedidos: 278, ingresos: 5560 },
  { dia: "Jue", pedidos: 234, ingresos: 4680 },
  { dia: "Vie", pedidos: 312, ingresos: 6240 },
  { dia: "Sáb", pedidos: 398, ingresos: 7960 },
  { dia: "Dom", pedidos: 356, ingresos: 7120 },
];

const topZones = [
  { zona: "Centro", pedidos: 456, porcentaje: 28 },
  { zona: "Norte", pedidos: 389, porcentaje: 24 },
  { zona: "Sur", pedidos: 312, porcentaje: 19 },
  { zona: "Este", pedidos: 278, porcentaje: 17 },
  { zona: "Oeste", pedidos: 195, porcentaje: 12 },
];

export default function Estadisticas() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Estadísticas</h1>
        <p className="text-muted-foreground mt-1">Análisis detallado del rendimiento</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32 min</div>
            <p className="text-xs text-success">-5 min vs mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">96.8%</div>
            <p className="text-xs text-success">+2.1% vs mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calificación</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7 ⭐</div>
            <p className="text-xs text-success">+0.3 vs mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zona Top</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Centro</div>
            <p className="text-xs text-muted-foreground">456 pedidos esta semana</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Semanal</CardTitle>
            <CardDescription>Pedidos e ingresos de los últimos 7 días</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="dia" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="pedidos" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="ingresos" 
                  stroke="hsl(var(--accent))" 
                  fill="hsl(var(--accent))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entregas por Horario</CardTitle>
            <CardDescription>Distribución de pedidos durante el día</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deliveryTimes}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hora" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                />
                <Bar dataKey="entregas" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zonas de Mayor Demanda</CardTitle>
          <CardDescription>Top 5 zonas con más pedidos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topZones.map((zone) => (
              <div key={zone.zona} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">{zone.zona}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{zone.pedidos} pedidos</span>
                    <span className="text-sm font-medium text-foreground">{zone.porcentaje}%</span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${zone.porcentaje}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
