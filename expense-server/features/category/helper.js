import HeadCategoryModel from "./headCategoryModel.js";
import CategoryModel from "./model.js";

export const countCustomCategoryAndHeadCategory = async (userId) => {
  const headCategoryCount = await HeadCategoryModel.countDocuments({
    user: userId,
    isCustom: true,
  });

  const categoryCount = await CategoryModel.countDocuments({
    user: userId,
    isCustom: true,
  });

  return headCategoryCount + categoryCount;
};
