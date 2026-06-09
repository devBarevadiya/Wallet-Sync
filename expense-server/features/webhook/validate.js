import { REVENUE_CAT_HEADER_SECRET } from "../../config/env.js";
import { errorResponse } from "../../helper/apiResponse.js";

class validate {
  static revenueCat = async (req, res, next) => {
    const authHeaderSecret = req.headers["authorization"];

    if (authHeaderSecret !== REVENUE_CAT_HEADER_SECRET) {
      return errorResponse({
        res,
        statusCode: 403,
        message: "Unauthorized",
      });
    }

    next();
  };
}

export default validate;
