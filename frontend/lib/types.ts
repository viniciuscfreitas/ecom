export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string | null;
  imageUrl: string | null;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
  };
}

export interface Address {
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  zipCode: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  paymentId?: string;
  paymentStatus?: string;
  shippingValue?: number;
  deliveryTime?: string;
  items: OrderItem[];
  address: Address | null;
  createdAt: string;
}

export interface PaymentData {
  id: string;
  status: string;
  qrCode?: string;
  pixKey?: string;
  isMock?: boolean;
}

