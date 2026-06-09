import mongoose from "mongoose";
import { paymentStatusEnum } from "../../config/enum.js";

const mongooseSchema = mongoose.Schema(
  {
    planned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Planned",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(paymentStatusEnum),
      default: paymentStatusEnum.PENDING,
    },
  },
  { timestamps: true }
);

mongooseSchema.index({ planned: 1 });
mongooseSchema.index({ createdAt: -1 });
const PaymentModel = mongoose.model("Payment", mongooseSchema);

export default PaymentModel;
