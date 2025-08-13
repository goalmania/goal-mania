import mongoose, { Schema, Document } from "mongoose";

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  productId?: string;
  customization?: {
    name?: string;
    number?: string;
    selectedPatches?: Array<{
      id: string;
      name: string;
      image: string;
      price?: number;
    }>;
    includeShorts?: boolean;
    includeSocks?: boolean;
    isPlayerEdition?: boolean;
    size?: string;
    isKidSize?: boolean;
    hasCustomization?: boolean;
    excludedShirts?: string[];
  };
}

export interface IOrder extends Document {
  userId: string;
  items: OrderItem[];
  amount: number;
  status: string;
  createdAt: Date;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentIntentId?: string;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
  refunded?: boolean;
  refundedAt?: Date;
  refundReference?: string;
  trackingCode?: string;
  coupon?: {
    code: string;
    discountPercentage: number;
    discountAmount: number;
  };
}

const OrderSchema = new Schema<IOrder>({
  userId: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      productId: String,
      customization: {
        name: String,
        number: String,
        selectedPatches: [
          {
            id: String,
            name: String,
            image: String,
            price: Number,
          },
        ],
        includeShorts: Boolean,
        includeSocks: Boolean,
        isPlayerEdition: Boolean,
        size: String,
        isKidSize: Boolean,
        hasCustomization: Boolean,
        excludedShirts: [String],
      },
    },
  ],
  amount: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    default: "pending",
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
  },
  createdAt: { type: Date, default: Date.now },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  paymentIntentId: { type: String },
  cancelledAt: { type: Date },
  cancelledBy: { type: String },
  cancellationReason: { type: String },
  refunded: { type: Boolean, default: false },
  refundedAt: { type: Date },
  refundReference: { type: String },
  trackingCode: { type: String },
  coupon: {
    code: String,
    discountPercentage: Number,
    discountAmount: Number,
  },
});

// Check if model is already defined to prevent overwrite errors during development hot reload
export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
