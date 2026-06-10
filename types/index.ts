export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "user" | "admin" | "vendor";
  createdAt: Date;
  updatedAt: Date;
}

// Matches the Mongoose Product model and IProduct in lib/types/product.ts
export interface Product {
  _id: string;
  slug?: string;
  title: string;
  description: string;
  basePrice: number;
  retroPrice?: number;
  shippingPrice: number;
  stockQuantity: number;
  images: string[];
  videos?: string[];
  category: string;
  isActive: boolean;
  feature: boolean;
  isRetro: boolean;
  isMysteryBox: boolean;
  isWorldCup: boolean;
  nationalTeam?: string;
  hasLongSleeve: boolean;
  longSleevePriceAddon: number;
  allowsNameOnShirt: boolean;
  allowsNumberOnShirt: boolean;
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Rating {
  userId: string;
  rating: number;
  createdAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  shippingAddress: Address;
  paymentStatus: PaymentStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "processing" | "succeeded" | "failed";

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}
