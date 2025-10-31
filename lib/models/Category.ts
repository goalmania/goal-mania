import mongoose from 'mongoose';

export interface ICategory {
  name: string;
  slug: string;
  type: 'league' | 'product-type' | 'special';
  description?: string;
  parentId?: mongoose.Types.ObjectId;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['league', 'product-type', 'special'],
    },
    description: {
      type: String,
      trim: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ type: 1 });
categorySchema.index({ parentId: 1 });

export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);