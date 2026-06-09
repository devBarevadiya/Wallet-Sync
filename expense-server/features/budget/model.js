import mongoose from "mongoose";
import {
  budgetNotificationThresholdPercentageEnum,
  budgetRolloverUserResponse,
  budgetSpendLimitType,
  budgetStatusType,
  budgetPeriodEnum,
} from "../../config/enum.js";

const mongooseSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(budgetStatusType),
      default: budgetStatusType.OPEN,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rollover: {
      generatedAmount: { type: Number, required: true, default: 0 },
      acceptedAmount: { type: Number, required: true, default: 0 },
      userResponse: {
        type: String,
        enum: Object.values(budgetRolloverUserResponse),
        default: budgetRolloverUserResponse.ACCEPTED,
      },
    },

    notifications: [
      {
        type: String,
        required: true,
        enum: Object.values(budgetNotificationThresholdPercentageEnum),
      },
    ],

    period: {
      type: String,
      required: true,
      enum: Object.values(budgetPeriodEnum),
    },

    maxAmount: {
      type: Number,
      required: true,
    },
    remainingAmount: {
      type: Number,
      required: true,
    },
    spendAmount: {
      type: Number,
      required: true,
      default: 0,
    },

    headCategories: [
      {
        headCategory: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "HeadCategory",
          required: true,
        },
        maxAmount: {
          type: Number,
          required: true,
        },
        remainingAmount: {
          type: Number,
          required: true,
        },
        spendAmount: {
          type: Number,
          default: 0,
        },
        spendLimitType: {
          type: String,
          required: true,
          enum: Object.values(budgetSpendLimitType),
        },

        notifications: [
          {
            type: String,
            required: true,
            enum: Object.values(budgetNotificationThresholdPercentageEnum),
          },
        ],

        categories: [
          {
            category: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Category",
              required: true,
            },
            maxAmount: {
              type: Number,
              default: 0,
              required: true,
            },
            remainingAmount: {
              type: Number,
              default: 0,
              required: true,
            },
            spendAmount: {
              type: Number,
              default: 0,
            },
            spendLimitType: {
              type: String,
              required: true,
              enum: Object.values(budgetSpendLimitType),
            },

            notifications: [
              {
                type: String,
                required: true,
                enum: Object.values(budgetNotificationThresholdPercentageEnum),
              },
            ],
          },
        ],
      },
    ],

    accounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
      },
    ],

    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: true,
      },
    ],

    prevBudget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      default: null,
    },
    nextBudget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      default: null,
    },
  },
  { timestamps: true }
);

mongooseSchema.index({ createdAt: -1 });
mongooseSchema.index({ createdBy: 1 });

const BudgetModel = mongoose.model("Budget", mongooseSchema);

export default BudgetModel;
