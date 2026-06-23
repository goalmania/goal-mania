import mongoose, { Schema, Document } from "mongoose";

export interface IAbandonedCart extends Document {
  email: string;
  items: Array<{ id: string; slug?: string; name: string; price: number; quantity: number; image: string }>;
  total: number;
  recoveryToken: string;
  emailSentAt?: Date;
  recoveredAt?: Date;
  createdAt: Date;
}

const AbandonedCartSchema = new Schema<IAbandonedCart>(
  {
    email: { type: String, required: true, index: true },
    items: [{ id: String, slug: String, name: String, price: Number, quantity: Number, image: String }],
    total: { type: Number, required: true },
    recoveryToken: { type: String, required: true, unique: true, index: true },
    emailSentAt: { type: Date },
    recoveredAt: { type: Date },
  },
  { timestamps: true }
);

// Auto-delete after 30 days
AbandonedCartSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export const AbandonedCart =
  (mongoose.models.AbandonedCart as mongoose.Model<IAbandonedCart>) ||
  mongoose.model<IAbandonedCart>("AbandonedCart", AbandonedCartSchema);
