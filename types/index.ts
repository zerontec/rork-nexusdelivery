export type UserRole = 'client' | 'driver' | 'business';

export type BusinessType = 'restaurant' | 'pharmacy' | 'retail' | 'services';

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'assigned' 
  | 'picking_up' 
  | 'in_transit' 
  | 'delivered' 
  | 'cancelled';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  businessId: string;
  stock: number;
  available: boolean;
  discount?: number;
  originalPrice?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
};

export type Business = {
  id: string;
  name: string;
  type: BusinessType;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  isOpen: boolean;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  discount?: number;
  featured?: boolean;
  tags?: string[];
  freeDelivery?: boolean;
};

export type CartItem = {
  productId: string;
  quantity: number;
  notes?: string;
};

export type Order = {
  id: string;
  businessId: string;
  clientId: string;
  driverId?: string;
  items: {
    productId: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
  status: OrderStatus;
  total: number;
  subtotal: number;
  deliveryFee: number;
  createdAt: Date;
  estimatedDelivery?: Date;
  deliveryAddress: {
    lat: number;
    lng: number;
    address: string;
    notes?: string;
  };
  paymentMethod: string;
};

export type Driver = {
  id: string;
  name: string;
  photo: string;
  rating: number;
  reviews: number;
  vehicle: {
    type: 'bike' | 'motorcycle' | 'car';
    plate: string;
  };
  isAvailable: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  earnings: {
    today: number;
    week: number;
    month: number;
  };
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  role: UserRole;
  addresses?: {
    id: string;
    label: string;
    address: string;
    lat: number;
    lng: number;
    isDefault: boolean;
  }[];
};
