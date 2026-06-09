import express from "express";
import controller from "./controller.js";
import validate from "./validate.js";
import { verifyUser } from "../../middleware/verifyMiddleware.js";
import {
  checkAuthorization,
  permissions,
} from "../../middleware/checkAuthorization.js";
import { authRoleEnum } from "../../config/enum.js";

const route = express.Router();

route.post("/register", validate.register, controller.register);

// route.post(
//   "/register/firebase",
//   validate.registerFirebase,
//   controller.registerFirebase
// );

route.post("/login", validate.login, controller.login);
route.post("/login/firebase", validate.loginFirebase, controller.loginFirebase);

route.get("/verifyToken", verifyUser, controller.verifyToken);

route.post(
  "/setcurrency",
  verifyUser,
  validate.setCurrency,
  controller.setCurrency
);

route.get(
  "/",
  verifyUser,
  checkAuthorization({
    permission: permissions.GET_ALL_USER,
  }),
  controller.get
);
route.get("/currency", verifyUser, controller.getCurrency);

route.get(
  "/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.GET_USER,
    comparisonFn: ({ req }) => {
      const { _id, role } = req.user;
      const { id } = req.params;
      // user role can access only own record
      if (role === authRoleEnum.USER && String(_id) !== String(id)) {
        return false;
      }

      return true;
    },
  }),
  controller.getDetails
);

route.delete("/logout", verifyUser, validate.logout, controller.logout);

route.delete("/all-data", verifyUser, controller.deleteAllData);
route.delete("/transactions", verifyUser, controller.deleteTransactions);
route.delete(
  "/transactions-app-settings",
  verifyUser,
  controller.deleteTransactionsAndAppSettings
);
route.delete(
  "/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.DELETE_USER,
  }),
  controller.delete
);

route.post(
  "/notification",
  verifyUser,
  validate.setAllowedNotification,
  controller.setAllowedNotification
);
route.post(
  "/device-tokens",
  verifyUser,
  validate.addDeviceToken,
  controller.addDeviceToken
);
route.post(
  "/forgotpassword",
  validate.forgotPassword,
  controller.forgotPassword
);
route.post(
  "/forgotpassword-otp",
  validate.forgotPassword,
  controller.forgotPasswordOtp
);
route.post("/verifyOtp", validate.otpVerification, controller.otpVerification);
route.post("/resendOtp", controller.resendOTP);

route.patch(
  "/changepassword",
  verifyUser,
  validate.changePassword,
  controller.changePassword
);
route.patch(
  "/role/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.PATCH_USER_ROLE,
  }),
  validate.patchRole,
  controller.patch
);
route.patch(
  "/basecurrency",
  verifyUser,
  validate.patchBaseCurrency,
  controller.patchBaseCurrency
);
route.patch(
  "/:id",
  verifyUser,
  checkAuthorization({
    permission: permissions.PATCH_USER_PROFILE,
    comparisonFn: ({ req }) => {
      const { role, _id } = req.user;

      // Patch own profile for user
      if (
        role === authRoleEnum.ADMIN ||
        String(_id) === String(req.params.id)
      ) {
        return true;
      } else {
        return false;
      }
    },
  }),
  validate.patch,
  controller.patch
);
route.patch(
  "/resetpassword/:token",
  validate.resetPassword,
  controller.resetPassword
);

export default route;
