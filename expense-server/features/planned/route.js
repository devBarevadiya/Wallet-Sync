import express from "express";
import controller from "./controller.js";
import validate from "./validate.js";
import { verifyUser } from "../../middleware/verifyMiddleware.js";
import {
  checkAuthorization,
  permissions,
} from "../../middleware/checkAuthorization.js";

const route = express.Router();

route.get("/", verifyUser, validate.get, controller.get);
route.get("/:id", verifyUser, controller.getDetails);

route.post("/get", verifyUser, validate.get, controller.get);
route.post("/", verifyUser, validate.create, controller.create);

route.delete(
  "/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.DELETE_PLANNED,
  }),
  controller.delete
);
route.patch("/:id", verifyUser, validate.patch, controller.patch);

export default route;
