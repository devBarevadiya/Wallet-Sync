import express from "express";

import { verifyUser } from "../../middleware/verifyMiddleware.js";
import controller from "./controller.js";
import validate from "./validate.js";

const route = express.Router();

// Get all payee for req user
route.get("/", verifyUser, controller.getAll);

// Create a payee
route.post("/", verifyUser, validate.create, controller.create);

// Update a payee
route.patch("/:payeeId", verifyUser, validate.update, controller.update);

// Delete multiple payee
route.delete("/", verifyUser, validate.deleteMany, controller.deleteMany);

export default route;
