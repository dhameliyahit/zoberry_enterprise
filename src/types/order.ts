export type OrderItem = {
  product: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type Order = {
  _id: string;
  orderNumber: string;
  customer: any;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: "cod" | "card" | "upi" | "netbanking" | "wallet" | "uropay";
  notes: string;
  createdAt: string;
};
