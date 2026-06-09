import express from "express";
import controller from "./controller.js";
import { verifyUser } from "../../middleware/verifyMiddleware.js";
import validate from "./validate.js";

const route = express.Router();

route.post("/analytics", verifyUser, validate.get, controller.getAnalytics);

export default route;
