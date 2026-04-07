import mongoose from "mongoose";
import {
  VALID_ADULT_SIZES,
  VALID_KID_SIZES,
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
      min: [0, "Retro price cannot be negative"],
      default: 35,
    },
    /** * Renamed to hasLongSleeve to match Frontend Zod Schema
     */
    hasLongSleeve: {
      type: Boolean,
      default: false,
    },
    longSleevePriceAddon: {
      type: Number,
      default: 10,
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
    },
    videos: {
      type: [String],
      default: [],
    },
    isWorldCup: {
      type: Boolean,
      default: false,
    },
    /**
     * Renamed to country to match Frontend Zod Schema
     */
    country: {
      type: String,
      trim: true,
      default: "", 
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
      index: true,
    },
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
      unique: true,
      lowercase: true,
      trim: true
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

/**
 * Validation to ensure country is provided if isWorldCup is true
 */
productSchema.pre("validate", function (next) {
  if (this.isWorldCup && (!this.country || this.country.trim() === "")) {
    return next(new Error("Country is required for World Cup products"));
  }

  // Auto-generate slug if missing
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

productSchema.virtual("averageRating").get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / this.reviews.length;
});

productSchema.index({ title: "text", description: "text" });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isWorldCup: 1, country: 1 }); 
productSchema.index({ feature: -1, createdAt: -1 });

if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const Product = mongoose.model("Product", productSchema);

export default Product;