import mongoose from "mongoose";
import { paymentTypeEnum, templateTypeEnum } from "../../config/enum.js";

const mongooseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    amount: { type: Number, default: 0 },
    type: {
      type: String,
      enum: Object.values(templateTypeEnum),
      default: templateTypeEnum.EXPENSE,
    },
    currency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
      required: true,
    },
    payWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payee",
    },
    labels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label",
      },
    ],
    paymentType: {
      type: String,
      enum: Object.values(paymentTypeEnum),
      default: paymentTypeEnum.CASH,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true }
);

mongooseSchema.index({ title: 1, user: 1 }, { unique: true });
const TemplateModel = mongoose.model("Template", mongooseSchema);

export default TemplateModel;
