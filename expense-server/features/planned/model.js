import mongoose from "mongoose";
import {
  confirmationTypeEnum,
  everyTypeEnum,
  paymentTypeEnum,
  scheduleTypeEnum,
  templateTypeEnum,
  weekdaysEnums,
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
      enum: Object.values(templateTypeEnum),
      default: templateTypeEnum.EXPENSE,
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
      required: true,
    },
    confirmationType: {
      type: String,
      enum: Object.values(confirmationTypeEnum),
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payee",
      default: null,
    },
    paymentType: {
      type: String,
      enum: Object.values(paymentTypeEnum),
      required: true,
    },
    labels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label",
        required: true,
      },
    ],
    note: {
      type: String,
      default: "",
    },
    every: {
      type: Number,
      default: null,
    },
    everyType: {
      type: String,
      enum: Object.values(everyTypeEnum),
      default: everyTypeEnum.NULL,
    },
    weekday: {
      type: String,
      enum: Object.keys(weekdaysEnums),
      default: weekdaysEnums.NULL,
    },
    amount: { type: Number, required: true },
    scheduleDate: {
      type: Date,
      required: true,
    },
    scheduleType: {
      type: String,
      required: true,
      enum: Object.values(scheduleTypeEnum),
    },
    stopDate: {
      type: Date,
      default: null,
    },
    maxRepetitions: {
      type: Number,
      default: null,
    },
    repetitionsCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

mongooseSchema.index({ createdAt: -1 });
mongooseSchema.index({ title: 1, user: 1 }, { unique: true });
const PlannedModel = mongoose.model("Planned", mongooseSchema);

export default PlannedModel;
