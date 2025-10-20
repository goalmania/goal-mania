import mongoose from "mongoose";

const patchSchema = new mongoose.Schema(
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
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["champions-league", "serie-a", "coppa-italia", "europa-league", "other"],
      default: "other",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
    createdBy: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: String,
      required: true,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
patchSchema.index({ category: 1, isActive: 1 });
patchSchema.index({ isFeatured: 1, isActive: 1 });
patchSchema.index({ sortOrder: 1 });

// Virtual for formatted price
patchSchema.virtual('formattedPrice').get(function() {
  return `€${this.price.toFixed(2)}`;
});

// Ensure virtuals are included in JSON output
patchSchema.set('toJSON', { virtuals: true });

// Use a global cache to avoid re-compiling model in serverless/hot-reload environments
declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var __MONGOOSE_MODELS__: any;
}

const getCachedModel = () => {
  const globalAny: any = globalThis as any;
  if (!globalAny.__MONGOOSE_MODELS__) {
    globalAny.__MONGOOSE_MODELS__ = {};
  }

  if (globalAny.__MONGOOSE_MODELS__.Patch) {
    return globalAny.__MONGOOSE_MODELS__.Patch;
  }

  // If mongoose already has the model, prefer that
  const existing = mongoose.models?.Patch;
  if (existing) {
    globalAny.__MONGOOSE_MODELS__.Patch = existing;
    return existing;
  }

  const model = mongoose.model("Patch", patchSchema);
  globalAny.__MONGOOSE_MODELS__.Patch = model;
  return model;
};

const Patch = getCachedModel();

export default Patch;