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
    permission: permissions.GET_PROMO_CODE,
  }),
  controller.get
);

route.post(
  "/generate",
  verifyUser,
  checkAuthorization({
    permission: permissions.GENERATE_PROMO_CODE,
  }),
  validate.create,
  controller.create
);

route.post(
  "/apply",
  verifyUser,
  validate.applyPromoCode,
  controller.applyPromoCode
);

route.delete(
  "/",
  verifyUser,
  checkAuthorization({
    permission: permissions.DELETE_PROMO_CODE,
  }),
  validate.delete,
  controller.deleteByIds
);

export default route;
