import { Driver } from '@/types';

export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'd1',
    name: 'Carlos Ramírez',
    photo: 'https://i.pravatar.cc/150?img=12',
    rating: 4.9,
    reviews: 345,
    vehicle: {
      type: 'motorcycle',
      plate: 'ABC-123',
    },
    isAvailable: true,
    currentLocation: {
      lat: 40.7128,
      lng: -74.0060,
    },
    earnings: {
      today: 85.50,
      week: 520.30,
      month: 2145.80,
    },
  },
  {
    id: 'd2',
    name: 'María González',
    photo: 'https://i.pravatar.cc/150?img=45',
    rating: 4.8,
    reviews: 289,
    vehicle: {
      type: 'bike',
      plate: 'N/A',
    },
    isAvailable: true,
    currentLocation: {
      lat: 40.7138,
      lng: -74.0070,
    },
    earnings: {
      today: 72.20,
      week: 445.60,
      month: 1890.40,
    },
  },
  {
    id: 'd3',
    name: 'Juan Pérez',
    photo: 'https://i.pravatar.cc/150?img=33',
    rating: 4.7,
    reviews: 412,
    vehicle: {
      type: 'car',
      plate: 'XYZ-789',
    },
    isAvailable: false,
    currentLocation: {
      lat: 40.7148,
      lng: -74.0050,
    },
    earnings: {
      today: 95.80,
      week: 610.50,
      month: 2560.90,
    },
  },
];
