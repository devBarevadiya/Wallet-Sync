import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
import {
  authProviderEnum,
  authRoleEnum,
  deviceTypeEnum,
  allowedNotificationsEnum,
  summaryReportFrequency,
  subscriptionTypeEnum,
  paymentPlatformEnum,
} from "../../config/enum.js";

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    otp: {
      type: Number,
      default: null,
    },
    otpExpiration: {
      type: Date,
    },
    currencies: [
      {
        currency: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Currency",
          required: true,
        },
        isBase: { type: Boolean, default: false },
        _id: false,
      },
    ],
    avatar: { type: String },
    authProvider: {
      type: String,
      enum: Object.values(authProviderEnum),
      default: authProviderEnum.LOCAL,
    },
    role: {
      type: String,
      enum: Object.values(authRoleEnum),
      default: authRoleEnum.USER,
    },
    uid: {
      type: String,
      default: null,
    },
    allowedNotifications: {
      type: [String],
      enum: Object.values(allowedNotificationsEnum),
      default: [],
    },
    deviceTokens: [
      {
        deviceToken: { type: String, required: true },
        deviceType: {
          type: String,
          enum: Object.values(deviceTypeEnum),
          required: true,
        },
      },
    ],
    txnThresholdAmount: {
      type: Number,
      default: null,
    },
    summaryReportCycle: {
      type: String,
      enum: Object.values(summaryReportFrequency),
      default: summaryReportFrequency.WEEKLY,
    },
    notifyOnTxnAccounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
      },
    ],
    notifyOnTxnLabels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label",
        required: true,
      },
    ],

    notifyOnTxnHeadCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HeadCategory",
        required: true,
      },
    ],
    subscriptionName: {
      type: String,
      default: "",
    },
    subscriptionType: {
      type: String,
      enum: Object.values(subscriptionTypeEnum),
      default: subscriptionTypeEnum.FREE,
    },
    subscriptionPurchasedAt: {
      type: Date,
      default: null,
    },
    subscriptionExpiredAt: {
      type: Date,
      default: null,
    },
    stipeCustomerId: {
      type: String,
      default: "",
    },
    subscriptionId: {
      type: String,
      default: "",
    },
    platform: {
      type: String,
      enum: Object.values(paymentPlatformEnum).concat(null),
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
});

userSchema.index({ createdAt: -1 });
const UserModel = mongoose.model("User", userSchema);

export default UserModel;
