import mongoose from "mongoose";

const mongooseSchema = mongoose.Schema(
  {
    symbol: { type: String, required: true },
    currency: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const CurrencyModel = mongoose.model("Currency", mongooseSchema);

export default CurrencyModel;
