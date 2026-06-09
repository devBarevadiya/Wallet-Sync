import express from "express";
import controller from "./controller.js";
import { verifyUser } from "../../middleware/verifyMiddleware.js";

const route = express.Router();

route.get("/lastrecord", verifyUser, controller.getLastRecord);
route.get("/spending", verifyUser, controller.getSpending);
route.get("/currency", verifyUser, controller.getCurrency);
route.get("/balance", verifyUser, controller.getBalance);
route.get("/balancetrend", verifyUser, controller.getBalanceTrend);
route.get("/cashflow", verifyUser, controller.getCashFlow);
route.get("/cashflowtable", verifyUser, controller.getCashFlowTable);
route.get("/report", verifyUser, controller.getReport);
route.get("/report/:id", verifyUser, controller.getReportDetails);

export default route;
