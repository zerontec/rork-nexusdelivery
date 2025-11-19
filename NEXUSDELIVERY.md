# NexusDelivery - Aplicación Universal de Delivery

## 📱 Descripción

NexusDelivery es una plataforma móvil completa de delivery y gestión de negocios construida con React Native y Expo. La aplicación está diseñada para ser altamente adaptable, minimalista y con una UX/UI excepcional, capaz de funcionar para cualquier tipo de negocio.

## ✨ Características Principales

### 🛒 Módulo Cliente
- Catálogo de productos/servicios con búsqueda y filtros
- Carrito de compras con persistencia
- Proceso de checkout completo
- Seguimiento de pedidos en tiempo real
- Historial de pedidos

### 🚴 Módulo Repartidor
- Dashboard de pedidos disponibles
- Sistema de aceptación/rechazo de pedidos
- Navegación y tracking de entregas
- Gestión de ganancias y estadísticas
- Estado de disponibilidad

### 🏪 Módulo Negocio
- Dashboard con estadísticas en tiempo real
- Gestión de inventario
- Visualización de pedidos activos
- Gestión de productos y stock

## 🎨 Componentes UI Creados

### Componentes Base
- **Button**: Botón personalizable con múltiples variantes y tamaños
- **Card**: Tarjeta contenedor con soporte para interacción
- **Badge**: Insignias para estados y categorías
- **Chip**: Chips seleccionables para filtros
- **Divider**: Separador horizontal/vertical
- **EmptyState**: Estado vacío con ilustración y acción
- **LoadingSpinner**: Indicador de carga
- **SearchBar**: Barra de búsqueda con funcionalidad de limpieza

### Componentes Especializados
- **BusinessCard**: Tarjeta de negocio con información y rating
- **ProductCard**: Tarjeta de producto con contador de cantidad
- **OrderStatusBadge**: Badge de estado de pedido
- **OrderTrackingMap**: Mapa de seguimiento con progreso visual
- **SkeletonLoader**: Cargadores skeleton para mejor UX

## 📂 Estructura del Proyecto

```
app/
  ├── (tabs)/           # Navegación por tabs
  │   ├── home/         # Módulo cliente
  │   ├── driver/       # Módulo repartidor
  │   ├── business/     # Módulo negocio
  │   ├── orders.tsx    # Pantalla de pedidos
  │   └── profile.tsx   # Pantalla de perfil
  ├── cart.tsx          # Carrito de compras
  ├── checkout.tsx      # Proceso de pago
  └── order-detail.tsx  # Detalle de pedido con tracking

components/
  ├── ui/               # Componentes UI reutilizables
  └── OrderTrackingMap.tsx

constants/
  ├── colors.ts         # Paleta de colores
  └── theme.ts          # Sistema de diseño

mocks/
  ├── businesses.ts     # Datos de negocios
  ├── products.ts       # Datos de productos
  ├── orders.ts         # Datos de pedidos
  └── drivers.ts        # Datos de repartidores

providers/
  ├── AppProvider.tsx       # Estado global de la app
  ├── CartProvider.tsx      # Estado del carrito
  └── OrdersProvider.tsx    # Estado de pedidos

types/
  └── index.ts          # Definiciones de tipos TypeScript
```

## 🎯 Pantallas Principales

### Para Clientes
1. **Home** - Explorar negocios cercanos
2. **Business Detail** - Ver productos de un negocio
3. **Cart** - Revisar y modificar carrito
4. **Checkout** - Finalizar compra
5. **Orders** - Historial de pedidos
6. **Order Detail** - Seguimiento en tiempo real

### Para Repartidores
1. **Dashboard** - Pedidos disponibles y estadísticas
2. **Active Order** - Navegación paso a paso
3. **Earnings** - Ganancias e historial

### Para Negocios
1. **Dashboard** - Resumen de ventas y pedidos
2. **Inventory** - Gestión de productos y stock
3. **Orders** - Pedidos activos e historial

## 🛠️ Tecnologías Utilizadas

- **React Native** - Framework principal
- **Expo** (SDK 54) - Herramientas de desarrollo
- **TypeScript** - Type safety
- **Expo Router** - Navegación file-based
- **Lucide Icons** - Iconografía
- **@nkzw/create-context-hook** - Manejo de estado

## 🎨 Sistema de Diseño

### Colores
- **Primary**: #FF6B6B (Rojo coral)
- **Secondary**: #4ECDC4 (Turquesa)
- **Accent**: #FFE66D (Amarillo)
- **Success**: #95E1D3
- **Warning**: #F38181
- **Error**: #E74C3C
- **Info**: #5DADE2

### Tipografía
- Tamaños: xs (12px) - xxl (32px)
- Pesos: normal (400) - bold (700)

### Espaciado
- Sistema de 8px grid (xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, xxl: 48px)

## 🚀 Características Implementadas

✅ Navegación multi-rol (Cliente, Repartidor, Negocio)
✅ Sistema de carrito con persistencia
✅ Checkout completo con múltiples métodos de pago
✅ Seguimiento de pedidos en tiempo real
✅ Dashboard de repartidor con gestión de ganancias
✅ Dashboard de negocio con inventario
✅ Componentes UI reutilizables y bien tipados
✅ Estados de carga y vacíos
✅ Diseño responsive y mobile-first
✅ Animaciones fluidas
✅ TypeScript estricto

## 📱 Cómo Usar

### Instalación
```bash
bun install
```

### Desarrollo
```bash
bun start
```

### Roles Disponibles
Al iniciar la app, puedes seleccionar entre:
- Cliente: Para realizar pedidos
- Repartidor: Para aceptar y entregar pedidos
- Negocio: Para gestionar productos y ventas

## 🔄 Estado de la Aplicación

La aplicación utiliza providers de contexto para manejar el estado:

- **AppProvider**: Rol actual del usuario
- **CartProvider**: Items del carrito y operaciones
- **OrdersProvider**: Lista de pedidos

## 🎯 Próximas Mejoras

- [ ] Integración con backend real
- [ ] Autenticación de usuarios
- [ ] Notificaciones push
- [ ] Mapa interactivo con ubicación real
- [ ] Chat entre usuarios
- [ ] Sistema de calificaciones
- [ ] Pagos integrados

## 📝 Notas

- Todos los datos son mocks para demostración
- La aplicación está optimizada para iOS y Android
- Compatible con React Native Web
- El código sigue las mejores prácticas de TypeScript
