import mongoose from "mongoose";

const OrderDetailsSchema = new mongoose.Schema(
  {
    paymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    fullItems: {
      type: Array,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addressId: {
      type: String,
      required: true,
    },
    couponData: {
      type: Object,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.OrderDetails ||
  mongoose.model("OrderDetails", OrderDetailsSchema);
