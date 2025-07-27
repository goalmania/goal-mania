export const VALID_ADULT_SIZES = ["S", "M", "L", "XL", "XXL", "3XL"] as const;

export const VALID_KID_SIZES = ["XS", "S", "M", "L", "XL"] as const;

export const VALID_PATCHES = [
  "champions-league",
  "serie-a",
  "coppa-italia",
] as const;

export const PRODUCT_CATEGORIES = [
  "2024/25",
  "2025/26",
  "Retro",
  "SerieA",
  "International",
  "Mystery Box",
] as const;

export type AdultSize = (typeof VALID_ADULT_SIZES)[number];
export type KidSize = (typeof VALID_KID_SIZES)[number];
export type Patch = (typeof VALID_PATCHES)[number];
export type Category = (typeof PRODUCT_CATEGORIES)[number];

// Simple Product interface for grid components
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  team?: string;
  availablePatches?: string[];
  videos?: string[];
}

export interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  media?: {
    images: string[];
    videos: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct {
  _id: string;
  title: string;
  description: string;
  basePrice: number;
  retroPrice?: number;
  shippingPrice: number;
  stockQuantity: number;
  images: string[];
  videos?: string[];
  adultSizes: AdultSize[];
  kidsSizes: KidSize[];
  category: Category;
  availablePatches: Patch[];
  hasShorts: boolean;
  hasSocks: boolean;
  hasPlayerEdition: boolean;
  allowsNameOnShirt: boolean;
  allowsNumberOnShirt: boolean;
  isActive: boolean;
  feature: boolean;
  isRetro: boolean;
  isMysteryBox: boolean;
  reviews: Review[];
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  customization: {
    name?: string;
    number?: string;
    selectedPatches: Patch[];
    includeShorts: boolean;
    includeSocks: boolean;
    includeShortsSocks: boolean;
    isPlayerEdition: boolean;
    size: string;
    isKidSize: boolean;
    hasCustomization: boolean;
    excludedShirts?: string[];
  };
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  team: string;
}
