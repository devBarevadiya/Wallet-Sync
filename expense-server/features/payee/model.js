import mongoose from "mongoose";

const mongooseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: null,
    },
    mobile: {
      type: Number,
      default: null,
    },
    business: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

mongooseSchema.index({ user: 1 });
const PayeeModel = mongoose.model("Payee", mongooseSchema);

export default PayeeModel;
