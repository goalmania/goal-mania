import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
  productId: { type: String, required: true },
});

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export { Review };
