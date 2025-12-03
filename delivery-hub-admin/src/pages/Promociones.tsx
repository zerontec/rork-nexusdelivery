import { Tag, Plus, Calendar, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const promociones = [
  {
    id: 1,
    nombre: "Envío Gratis Fin de Semana",
    codigo: "FREEWEEKEND",
    descuento: "Envío gratis",
    tipo: "Envío",
    inicio: "2024-01-20",
    fin: "2024-01-22",
    usos: 145,
    maxUsos: 500,
    estado: "Activa"
  },
  {
    id: 2,
    nombre: "20% OFF Primera Orden",
    codigo: "FIRST20",
    descuento: "20%",
    tipo: "Descuento",
    inicio: "2024-01-01",
    fin: "2024-03-31",
    usos: 234,
    maxUsos: 1000,
    estado: "Activa"
  },
  {
    id: 3,
    nombre: "2x1 en Comida Rápida",
    codigo: "2X1FAST",
    descuento: "2x1",
    tipo: "Especial",
    inicio: "2024-01-15",
    fin: "2024-01-31",
    usos: 89,
    maxUsos: 200,
    estado: "Activa"
  },
  {
    id: 4,
    nombre: "Black Friday Delivery",
    codigo: "BLACKFRI",
    descuento: "50%",
    tipo: "Descuento",
    inicio: "2023-11-24",
    fin: "2023-11-26",
    usos: 892,
    maxUsos: 1000,
    estado: "Finalizada"
  },
];

export default function Promociones() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Promociones</h1>
          <p className="text-muted-foreground mt-1">Gestiona cupones y ofertas especiales</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Promoción
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promociones Activas</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">3</div>
            <p className="text-xs text-muted-foreground mt-1">En curso actualmente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Canjes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1,360</div>
            <p className="text-xs text-success mt-1">+12% vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descuento Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">18%</div>
            <p className="text-xs text-muted-foreground mt-1">En todas las promos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ahorro Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$8,450</div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {promociones.map((promo) => (
          <Card key={promo.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{promo.nombre}</CardTitle>
                  <CardDescription className="mt-1">
                    Código: <span className="font-mono font-semibold text-foreground">{promo.codigo}</span>
                  </CardDescription>
                </div>
                <Badge variant={promo.estado === "Activa" ? "default" : "secondary"}>
                  {promo.estado}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Descuento</p>
                  <p className="text-lg font-semibold text-primary">{promo.descuento}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="text-lg font-semibold text-foreground">{promo.tipo}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Período de validez</p>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{promo.inicio}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-foreground">{promo.fin}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Usos</span>
                  <span className="font-medium text-foreground">
                    {promo.usos} / {promo.maxUsos}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${(promo.usos / promo.maxUsos) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" size="sm">
                  Editar
                </Button>
                <Button variant="outline" className="flex-1" size="sm">
                  Ver Detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
