import express from "express";
import controller from "./controller.js";
import validate from "./validate.js";
import { verifyUser } from "../../middleware/verifyMiddleware.js";

const route = express.Router();

route.get("/planned/:plannedId", verifyUser, validate.get, controller.get);
route.get("/:id", verifyUser, controller.getDetails);

route.patch("/:id", verifyUser, validate.patch, controller.patch);

export default route;
