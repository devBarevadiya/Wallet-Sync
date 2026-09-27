import cors from "cors";
import express from "express";
import session from "express-session";
import morgan from "morgan";
import passport from "passport";
import LocalStrategy from "passport-local";
import { join } from "path";
import {
  CLIENT_URL,
  DATABASE_URL,
  ORIGIN_URL,
  PORT,
  SECRET_KEY,
} from "./config/env.js";
import UserModel from "./features/user/model.js";
import { connectDb } from "./helper/connectDb.js";
import * as route from "./router.js";

// import cronjobs
import "./features/cron/balanceHistory.js";
import "./features/cron/budget.js";
import "./features/cron/inactivityReminder.js";
import "./features/cron/paymentReminder.js";
import "./features/cron/promoCode.js";
import "./features/cron/schedulePayment.js";
import "./features/cron/summaryReport.js";
import "./features/notification/firebase.js";

// events
import "./features/balanceHistory/event.js";
import "./features/budget/event.js";
import "./features/category/event.js";
import "./features/notification/email.js";

import moment from "moment";
import mongoose from "mongoose";
import { agenda } from "./config/agenda.js";
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

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowedOrigins = [CLIENT_URL, ORIGIN_URL]
      .filter(Boolean)
      .flatMap((value) => value.split(",").map((item) => item.trim()))
      .filter(Boolean);
    let hostname = "";
    try {
      hostname = new URL(origin).hostname;
    } catch (_) {}
    const isLocalOrigin =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]";
    const isVercelPreview = hostname.endsWith(".vercel.app");

    if (isLocalOrigin || isVercelPreview || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200,
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

// Health check endpoint for Render / keep-alive pings
app.get("/api/health", (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? "ok" : "starting",
    message: databaseReady
      ? "Server is healthy"
      : "Server is waiting for the database connection",
    timestamp: new Date(),
  });
});

app.get("/", (req, res) => {
  res.status(200).send("WalletSync Server is running");
});

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
const listen = (port) =>
  new Promise((resolve, reject) => {
    const server = app.listen(port, "0.0.0.0");
    server.on("listening", () => resolve(server));
    server.on("error", (err) => reject(err));
  });

const startServer = async () => {
  const basePort = Number(PORT) || 9000;

  let server;
  try {
    server = await listen(basePort);
  } catch (err) {
    if (err.code === "EADDRINUSE") {
      throw new Error(
        `Port ${basePort} is already in use. Please stop the process using this port or set PORT to a free port.`
      );
    }
    throw err;
  }

  console.log(`start listening on port http://localhost:${server.address().port}`);

  try {
    await connectDb(DATABASE_URL);
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
  } catch (error) {
    await new Promise((resolve) => server.close(resolve));
    throw error;
  }
};

startServer().catch((error) => {
  console.error("Failed to start server:", error.message || error);
  process.exit(1);
});

// Uncaught exceptions and unhandled rejections
process.on("uncaughtException", function (err) {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
process.on("unhandledRejection", function (err) {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});
