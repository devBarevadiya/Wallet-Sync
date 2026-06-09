import Joi from "joi";
import { validateResponse } from "../../helper/apiResponse.js";

const options = {
  abortEarly: false,
};

class validate {
  static upsert = async (req, res, next) => {
    const validateSchema = Joi.object().keys({
      createAccountLimit: Joi.number().optional(),
    });

    const { error } = validateSchema.validate(req.body, options);
    if (error) return validateResponse(res, error);

    next();
  };
}

export default validate;
