import express from "express";
import { DATABASE_URL, ORIGIN_URL, PORT, SECRET_KEY } from "./config/env.js";
import morgan from "morgan";
import cors from "cors";
import { connectDb } from "./helper/connectDb.js";
import * as route from "./router.js";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import UserModel from "./features/user/model.js";
import { join } from "path";

// import cronjobs
import "./features/cron/schedulePayment.js";
import "./features/notification/firebase.js";
import "./features/cron/paymentReminder.js";
import "./features/cron/inactivityReminder.js";
import "./features/cron/summaryReport.js";
import "./features/cron/balanceHistory.js";
import "./features/cron/budget.js";
import "./features/cron/promoCode.js";

// events
import "./features/budget/event.js";
import "./features/category/event.js";
import "./features/balanceHistory/event.js";
import "./features/notification/email.js";

import { agenda } from "./config/agenda.js";
import moment from "moment";
import {
  allowedNotificationsEnum,
  summaryReportFrequency,
} from "./config/enum.js";

// initialize server
const app = express();

app.use((req, res, next) => {
  if (req.originalUrl === "/api/webhook/stripe") {
    next();
  } else {
    express.json({ limit: "50mb" })(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

// Handle Client Server
// const corsOptions = {
//   origin: ORIGIN_URL.split(",").map((url) => url.trim()),
//   optionsSuccessStatus: 200,
// };

const corsOptions = {
  origin: [
    "http://localhost:8600",
    "http://localhost:5175",
    "https://walletsync-web.vercel.app",
    "https://walletsync-app.vercel.app",
  ],
};

app.use(cors(corsOptions));

// Setup Passport and express-session
app.use(
  session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Use LocalStrategy for passport-local
passport.use(new LocalStrategy(UserModel.authenticate()));

passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

const BASE_URL = "/api";

// Public Routes
app.use(BASE_URL + "/aws", route.awsS3Route);
app.use(BASE_URL + "/user", route.userRoute);
app.use(BASE_URL + "/budget", route.budgetRoute);
app.use(BASE_URL + "/account", route.accountRoute);
app.use(BASE_URL + "/group", route.groupRoute);
app.use(BASE_URL + "/category", route.categoryRoute);
app.use(BASE_URL + "/currency", route.currencyRoute);
app.use(BASE_URL + "/chart", route.chartRoute);
app.use(BASE_URL + "/label", route.labelRoute);
app.use(BASE_URL + "/template", route.templateRoute);
app.use(BASE_URL + "/planned", route.plannedRoute);
app.use(BASE_URL + "/transaction", route.transactionRoute);
app.use(BASE_URL + "/accounttype", route.accountTypeRoute);
app.use(BASE_URL + "/blogs", route.blogRoute);
app.use(BASE_URL + "/dashboard", route.dashboardRoute);
app.use(BASE_URL + "/payment", route.paymentRoute);
app.use(BASE_URL + "/notifications", route.notificationRoute);
app.use(BASE_URL + "/payee", route.payeeRoute);
app.use(BASE_URL + "/settings", route.settingRoute);
app.use(BASE_URL + "/promo-code", route.promoCodeRoute);

app.use(BASE_URL + "/stripe", route.stripeRoute);
app.use(BASE_URL + "/webhook", route.webhookRoute);

// Static
app.use("/uploads", express.static(join(process.cwd(), "pages")));

// Start listing server
app.listen(9000, "0.0.0.0", async () => {
  await connectDb(DATABASE_URL);
  console.log(`start listening on port http://localhost:${PORT}`);

  await agenda.start();

  const oldJobs = await agenda.jobs({ nextRunAt: { $lt: moment().toDate() } });

  for (const job of oldJobs) {
    console.log("Cancelling job:", job.attrs._id);
    await agenda.cancel({ _id: job.attrs._id });
  }

  // Run at every midnight
  await agenda.every("1 0 * * *", "create balance history");

  await agenda.every("1 0 * * *", "promoCode");

  await agenda.every(
    "0 20 * * *",
    allowedNotificationsEnum.TXN_INACTIVITY_REMINDER
  );

  await agenda.every("0 0 * * *", allowedNotificationsEnum.SUMMARY_REPORT, {
    summaryReportCycle: summaryReportFrequency.DAILY,
  });

  await agenda.every("1 0 * * *", "dailyCron");

  await agenda.every("0 20 * * 0", "weeklyCron");

  await agenda.every("55 23 * * *", allowedNotificationsEnum.SUMMARY_REPORT, {
    summaryReportCycle: summaryReportFrequency.DAILY,
  });

  await agenda.every("55 23 * * 0", allowedNotificationsEnum.SUMMARY_REPORT, {
    summaryReportCycle: summaryReportFrequency.WEEKLY,
  });

  await agenda.every(
    "55 23 28-31 * *",
    allowedNotificationsEnum.SUMMARY_REPORT,
    {
      summaryReportCycle: summaryReportFrequency.MONTHLY,
    }
  );

  await agenda.every("55 23 31 12 *", allowedNotificationsEnum.SUMMARY_REPORT, {
    summaryReportCycle: summaryReportFrequency.YEARLY,
  });
});

// Uncaught exceptions and unhandled rejections
process.on("uncaughtException", function (err) {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", function (err) {
  console.error("Unhandled Rejection:", err);
});
