import express from "express";

import { verifyUser } from "../../middleware/verifyMiddleware.js";
import controller from "./controller.js";
import validate from "./validate.js";
import {
  checkAuthorization,
  permissions,
} from "../../middleware/checkAuthorization.js";

const route = express.Router();

route.get(
  "/",
  verifyUser,
  validate.getAllByPagination,
  controller.getAllByPagination
);

route.post(
  "/custom",
  verifyUser,
  checkAuthorization({
    permission: permissions.SEND_CUSTOM_NOTIFICATION,
  }),
  validate.sendCustomNotification,
  controller.sendCustomNotification
);
route.delete("/", verifyUser, validate.deleteMany, controller.deleteMany);

export default route;
