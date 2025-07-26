import mongoose from "mongoose";
import {
  VALID_ADULT_SIZES,
  VALID_KID_SIZES,
  PRODUCT_CATEGORIES,
} from "@/lib/types/product";

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    media: {
      images: [{ type: String }],
      videos: [{ type: String }]
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters long"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
    },
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Base price cannot be negative"],
      default: 30,
    },
    retroPrice: {
      type: Number,
      required: [true, "Retro price is required"],
      min: [0, "Retro price cannot be negative"],
      default: 35,
    },
    shippingPrice: {
      type: Number,
      required: true,
      min: [0, "Shipping price cannot be negative"],
      default: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: [0, "Stock quantity cannot be negative"],
      default: 0,
    },
    images: {
      type: [String],
      required: [true, "At least one image is required"],
      validate: {
        validator: function (v: string[]) {
          return v.length > 0;
        },
        message: "At least one image is required",
      },
    },
    videos: {
      type: [String],
      default: [],
    },
    isRetro: {
      type: Boolean,
      default: false,
    },
    isMysteryBox: {
      type: Boolean,
      default: false,
    },
    hasShorts: {
      type: Boolean,
      default: false,
    },
    hasSocks: {
      type: Boolean,
      default: false,
    },
    hasPlayerEdition: {
      type: Boolean,
      default: false,
    },
    adultSizes: {
      type: [String],
      required: true,
      enum: VALID_ADULT_SIZES,
      default: ["S", "M", "L", "XL", "XXL"],
    },
    kidsSizes: {
      type: [String],
      required: false,
      enum: VALID_KID_SIZES,
      default: [],
    },
    category: {
      type: String,
      required: true,
      enum: PRODUCT_CATEGORIES,
    },
    // Reference to actual Patch documents
    patchIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patch',
    }],
    allowsNumberOnShirt: {
      type: Boolean,
      default: true,
    },
    allowsNameOnShirt: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      required: true,
      index: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    feature: {
      type: Boolean,
      default: false,
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Middleware to generate slug if not provided
productSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Virtual for average rating
productSchema.virtual("averageRating").get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / this.reviews.length;
});

// Create indexes
productSchema.index({ title: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ feature: -1, createdAt: -1 });

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
