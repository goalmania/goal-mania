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
    // Snapshot dell'indirizzo dell'utente registrato al momento del checkout.
    // Necessario perche' l'unico riferimento salvato altrove e' addressId:
    // se l'indirizzo viene modificato/eliminato tra l'inizio del checkout e
    // la conferma del pagamento, il webhook Stripe non trova piu' nulla e
    // l'ordine va perso anche se il pagamento e' andato a buon fine.
    addressSnapshot: {
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
