import { Order } from '@/types';

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    businessId: 'b1',
    clientId: 'u1',
    driverId: 'd1',
    items: [
      {
        productId: 'p1',
        quantity: 2,
        price: 12.99,
      },
      {
        productId: 'p2',
        quantity: 1,
        price: 14.99,
      },
    ],
    status: 'in_transit',
    subtotal: 40.97,
    deliveryFee: 2.5,
    total: 43.47,
    createdAt: new Date(Date.now() - 30 * 60000),
    estimatedDelivery: new Date(Date.now() + 10 * 60000),
    deliveryAddress: {
      lat: 40.7138,
      lng: -74.0070,
      address: 'Calle Secundaria 456, Apto 3B',
      notes: 'Tocar el timbre del apartamento 3B',
    },
    paymentMethod: 'Tarjeta de crédito',
  },
  {
    id: 'o2',
    businessId: 'b5',
    clientId: 'u2',
    driverId: 'd2',
    items: [
      {
        productId: 'p8',
        quantity: 2,
        price: 4.50,
      },
      {
        productId: 'p9',
        quantity: 1,
        price: 5.99,
      },
    ],
    status: 'preparing',
    subtotal: 14.99,
    deliveryFee: 2.0,
    total: 16.99,
    createdAt: new Date(Date.now() - 10 * 60000),
    deliveryAddress: {
      lat: 40.7148,
      lng: -74.0050,
      address: 'Avenida Norte 789, Oficina 201',
    },
    paymentMethod: 'Efectivo',
  },
  {
    id: 'o3',
    businessId: 'b2',
    clientId: 'u1',
    items: [
      {
        productId: 'p3',
        quantity: 2,
        price: 3.50,
      },
    ],
    status: 'pending',
    subtotal: 7.0,
    deliveryFee: 1.5,
    total: 8.5,
    createdAt: new Date(Date.now() - 5 * 60000),
    deliveryAddress: {
      lat: 40.7128,
      lng: -74.0060,
      address: 'Calle Principal 123, Casa 5',
    },
    paymentMethod: 'Efectivo',
  },
];
