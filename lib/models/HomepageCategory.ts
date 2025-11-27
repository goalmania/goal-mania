import mongoose from "mongoose";

export interface IHomepageCategory {
  title: string;
  category: string; // Product category name to filter by
  displayOrder: number; // Order in which to display on homepage
  isActive: boolean;
  limit?: number; // Number of products to show (default: 8)
  createdAt: Date;
  updatedAt: Date;
}

const homepageCategorySchema = new mongoose.Schema<IHomepageCategory>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters long"],
      maxlength: [100, "Title must be less than 100 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    displayOrder: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Display order must be non-negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    limit: {
      type: Number,
      default: 8,
      min: [1, "Limit must be at least 1"],
      max: [50, "Limit must be at most 50"],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
homepageCategorySchema.index({ isActive: 1, displayOrder: 1 });
homepageCategorySchema.index({ category: 1 });

// Create model if it doesn't exist
const HomepageCategory =
  mongoose.models.HomepageCategory ||
  mongoose.model<IHomepageCategory>("HomepageCategory", homepageCategorySchema);

export default HomepageCategory;

