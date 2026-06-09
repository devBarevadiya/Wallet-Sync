import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import { isExist } from "../../helper/isExist.js";
import CurrencyModel from "./model.js";

class controller {
  static create = async (req, res) => {
    try {
      const result = await CurrencyModel.create(req.body);
      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "Currency created successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "create.Currency",
      });
    }
  };
  static get = async (req, res) => {
    try {
      const { search } = req.query;

      const result = await CurrencyModel.aggregate([
        {
          $match: search
            ? {
                $or: [
                  { currency: { $regex: search, $options: "i" } },
                  { code: { $regex: search, $options: "i" } },
                ],
              }
            : {},
        },
        {
          $group: {
            _id: {
              $substr: ["$currency", 0, 1],
            },
            items: {
              $push: {
                _id: "$_id",
                symbol: "$symbol",
                currency: "$currency",
                code: "$code",
              },
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
        {
          $project: {
            _id: 0,
            alphabet: "$_id",
            items: 1,
          },
        },
      ]);

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Currency fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "get.Currency",
      });
    }
  };
  static delete = async (req, res) => {
    const { id } = req.params;
    try {
      await isExist(res, id, CurrencyModel);
      await CurrencyModel.findByIdAndDelete(id);

      return successResponse({
        res,
        statusCode: 200,
        message: "Documents deleted successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "delete.Currency",
      });
    }
  };
  static patch = async (req, res) => {
    const { id } = req.params;
    try {
      await isExist(res, id, CurrencyModel);
      const result = await CurrencyModel.findByIdAndUpdate(
        id,
        {
          $set: req.body,
        },
        { new: true }
      );
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Currency updated successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "patch.Currency",
      });
    }
  };
}
export default controller;
