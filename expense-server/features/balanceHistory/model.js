import mongoose from "mongoose";

const balanceHistorySchema = mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    balance: { type: Number, required: true },
  },
  { versionKey: false, timestamps: true }
);

const BalanceHistoryModel = mongoose.model(
  "BalanceHistory",
  balanceHistorySchema
);

export default BalanceHistoryModel;
