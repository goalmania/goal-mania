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
      required: false,
    },
    addressId: {
      type: String,
      required: false,
    },
    guestEmail: {
      type: String,
      required: false,
    },
    guestAddress: {
      type: Object,
      default: null,
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
