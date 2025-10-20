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

// Index for better query performance
patchSchema.index({ category: 1, isActive: 1 });
patchSchema.index({ isFeatured: 1, isActive: 1 });
patchSchema.index({ sortOrder: 1 });

// Virtual for formatted price
patchSchema.virtual('formattedPrice').get(function() {
  return `€${this.price.toFixed(2)}`;
});

// Ensure virtuals are included in JSON output
patchSchema.set('toJSON', { virtuals: true });

const Patch = mongoose.models.Patch || mongoose.model("Patch", patchSchema);

export default Patch; 