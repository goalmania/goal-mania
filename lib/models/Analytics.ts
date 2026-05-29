import mongoose, { Schema, Document } from "mongoose";

// ─── ActiveSession ────────────────────────────────────────────────────────────

export interface IActiveSession extends Document {
  sessionId: string;
  page: string;
  pageTitle: string;
  referrer: string;
  lastSeen: Date;
  cartItemCount: number;
  cartValue: number;
  isCheckingOut: boolean;
  country: string;
  device: "mobile" | "desktop" | "tablet";
  userId?: string;
}

const ActiveSessionSchema = new Schema<IActiveSession>({
  sessionId: { type: String, required: true, unique: true, index: true },
  page: { type: String, default: "/" },
  pageTitle: { type: String, default: "" },
  referrer: { type: String, default: "" },
  lastSeen: { type: Date, default: Date.now, index: { expireAfterSeconds: 300 } },
  cartItemCount: { type: Number, default: 0 },
  cartValue: { type: Number, default: 0 },
  isCheckingOut: { type: Boolean, default: false },
  country: { type: String, default: "IT" },
  device: { type: String, enum: ["mobile", "desktop", "tablet"], default: "desktop" },
  userId: { type: String },
});

// ─── ProductView ──────────────────────────────────────────────────────────────

export interface IProductView extends Document {
  productId: string;
  slug: string;
  title: string;
  image: string;
  views: number;
  addToCartCount: number;
  purchaseCount: number;
  date: Date;
}

const ProductViewSchema = new Schema<IProductView>({
  productId: { type: String, required: true },
  slug: { type: String, required: true },
  title: { type: String, default: "" },
  image: { type: String, default: "" },
  views: { type: Number, default: 0 },
  addToCartCount: { type: Number, default: 0 },
  purchaseCount: { type: Number, default: 0 },
  date: { type: Date, required: true, index: true },
});

ProductViewSchema.index({ productId: 1, date: 1 }, { unique: true });

// ─── FunnelEvent ──────────────────────────────────────────────────────────────

export interface IFunnelEvent extends Document {
  event: "page_view" | "product_view" | "add_to_cart" | "checkout_start" | "purchase";
  sessionId: string;
  page: string;
  productId?: string;
  productSlug?: string;
  value?: number;
  timestamp: Date;
}

const FunnelEventSchema = new Schema<IFunnelEvent>({
  event: {
    type: String,
    enum: ["page_view", "product_view", "add_to_cart", "checkout_start", "purchase"],
    required: true,
  },
  sessionId: { type: String, required: true },
  page: { type: String, required: true },
  productId: { type: String },
  productSlug: { type: String },
  value: { type: Number },
  timestamp: { type: Date, default: Date.now, index: { expireAfterSeconds: 2592000 } },
});

FunnelEventSchema.index({ event: 1, timestamp: -1 });

// ─── Model exports ────────────────────────────────────────────────────────────

export const ActiveSession =
  (mongoose.models.ActiveSession as mongoose.Model<IActiveSession>) ||
  mongoose.model<IActiveSession>("ActiveSession", ActiveSessionSchema);

export const ProductView =
  (mongoose.models.ProductView as mongoose.Model<IProductView>) ||
  mongoose.model<IProductView>("ProductView", ProductViewSchema);

export const FunnelEvent =
  (mongoose.models.FunnelEvent as mongoose.Model<IFunnelEvent>) ||
  mongoose.model<IFunnelEvent>("FunnelEvent", FunnelEventSchema);
