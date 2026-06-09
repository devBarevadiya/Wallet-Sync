import express from "express";
import controller from "./controller.js";
import validate from "./validate.js";
import { verifyUser } from "../../middleware/verifyMiddleware.js";
import {
  checkAuthorization,
  permissions,
} from "../../middleware/checkAuthorization.js";

const route = express.Router();

route.get(
  "/",
  verifyUser,
  checkAuthorization({
    permission: permissions.GET_SETTING,
  }),
  controller.get
);

route.patch(
  "/",
  verifyUser,
  checkAuthorization({
    permission: permissions.UPDATE_SETTING,
  }),
  validate.upsert,
  controller.upsert
);

export default route;
