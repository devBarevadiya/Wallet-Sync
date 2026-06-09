import mongoose from "mongoose";
import {
  creditDebitEnum,
  paymentTypeEnum,
  transactionStatusEnum,
  transactionTypeEnum,
} from "../../config/enum.js";

const mongooseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(transactionTypeEnum),
      default: transactionTypeEnum.EXPENSE,
    },
    currency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
      required: true,
    },
    amount: { type: Number, default: 0 },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: false,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    headCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HeadCategory",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    labels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label",
      },
    ],
    note: {
      type: String,
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payee",
      default: null,
    },
    warranty: {
      type: String,
    },
    paymentType: {
      type: String,
      enum: Object.values(paymentTypeEnum),
      default: paymentTypeEnum.CASH,
    },
    status: {
      type: String,
      enum: Object.values(transactionStatusEnum),
      default: transactionStatusEnum.CLEARED,
      required: true,
    },
    location: { type: String },
    photo: { type: String },
    creditDebit: {
      type: String,
      enum: Object.values(creditDebitEnum),
      default: null,
    },
    toTxn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
    },
    fromTxn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
    },
  },
  { timestamps: true }
);

mongooseSchema.index({ date: 1, user: 1 });
mongooseSchema.index({ date: 1, user: 1, type: 1 });
mongooseSchema.index({ date: -1 });
mongooseSchema.index({ note: "text" });

const TransactionModel = mongoose.model("Transaction", mongooseSchema);

async function updateMissingFields() {
  try {
    await TransactionModel.updateMany(
      { toTxn: { $exists: false } },
      { $set: { toTxn: null } }
    );

    await TransactionModel.updateMany(
      { fromTxn: { $exists: false } },
      { $set: { fromTxn: null } }
    );

    console.log("[INFO] Transaction Missing fields updated successfully.");
  } catch (error) {
    console.error(error);
  }
}

// Run the update function
updateMissingFields();

export default TransactionModel;
