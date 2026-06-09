import { useCallback, useEffect, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  capitalizeFirstLetter,
  formateAmount,
} from "../../../helpers/commonFunctions";
import { useDispatch } from "react-redux";
import {
  addUpdateHeadCategory,
  setSelectHeadCategory,
  setShowSubCategories,
} from "../../../store/budget/slice";
import { budgetLimitTypeEnum } from "../../../helpers/enum";
import { useSelector } from "react-redux";
import { getCategoryThunk } from "../../../store/actions";
import RemainListLoading from "./loading/RemainListLoading";

const RemainList = ({ data = [] }) => {
  const { detailsData, loading } = useSelector((state) => state.Budget);
  const { data: categories } = useSelector((state) => state.Category);
  const { baseCurrency } = useSelector((store) => store.Auth);
  const currencySymbol = baseCurrency?.symbol;
  const headData = data?.headCategories;
  // const { headCategories, period } = BudgetData.data;
  const dispatch = useDispatch();
  const period = data?.period;

  const handleSetSubCategory = useCallback(
    (category) => {
      // const formate = {
      //   headCategory: category?.headCategory?._id,
      //   maxAmount: category?.headCategory?.maxAmount,
      //   spendLimitType: category?.headCategory?.spendLimitType,
      //   categories: category?.categories?.length > 0 ? category : [{}],
      // };

      const [filterHead] = data?.headCategories?.filter(
        (item) => item?.headCategory?._id == category?.headCategory?._id
      ) || [{}];

      const [findHeadFromState] =
        categories?.filter(
          (item) => item?._id == category?.headCategory?._id
        ) || [];

      const setCategory = new Set(
        category?.categories?.map((item) => item?.category?._id)
      );

      const newCategories = findHeadFromState?.categories?.filter(
        (item) => !setCategory.has(item?._id)
      );

      const modifyArr = category?.categories?.map((item) => {
        return {
          category: item?._id,
          spendLimitType: budgetLimitTypeEnum.NO_LIMIT,
        };
      });

      dispatch(
        addUpdateHeadCategory({
          headCategoryId: category?.headCategory?._id,
          data: {
            headCategory: category?.headCategory?._id,
            spendLimitType: category?.headCategory?.spendLimitType,
            categories: modifyArr,
          },
        })
      );

      dispatch(
        setSelectHeadCategory({
          ...category,
          categories: newCategories?.map(({ category, ...item }) => ({
            ...item,
            ...category,
            category: item?._id,
          })),
          headCategory: category?.headCategory?._id,
        })
      );
      if (category?.categories?.length > 0) {
        dispatch(setShowSubCategories(category));
      } else {
        dispatch(setShowSubCategories({ ...category, categories: [{}] }));
      }
    },
    [categories, data, dispatch]
  );

  // const headTotal = useMemo(
  //   () => headData?.reduce((acc, curr) => Number(curr?.maxAmount) + acc, 0),
  //   [headData]
  // );

  useEffect(() => {
    if (!categories?.length) {
      dispatch(getCategoryThunk());
    }
  }, []);

  return (
    <div className="responsive  common-light-primary-shadow border common-border-color br-20 budgetCard card overflow-hidden mb-3 bg-white rounded">
      <div className="overflow-scroll-design budget-card-height p-20px p-sm-4 pt-0 pt-sm-0">
        <div className="card-header p-0 pb-2 pt-0 z-50 position-sticky top-0 pt-4 bg-white border-bottom border-dark-white-color">
          <h5 className="fs-21 fw-medium">Remain List</h5>
        </div>{" "}
        {!loading &&
          headData.map((category, index) => {
            const icon = category?.headCategory?.icon;
            const subCategories = category?.categories;
            const {
              headCategory,
              spendAmount,
              spendLimitType = "",
              remainingAmount = 0,
              maxAmount: amount = 0,
            } = category;

            const maxAmount =
              spendLimitType == budgetLimitTypeEnum.LIMIT
                ? amount
                : detailsData?.remainingAmount || 0;
            // : detailsData?.maxAmount - headTotal || 0;

            // const spendAmount = maxAmount - spend

            const divide = spendAmount / maxAmount;
            const percentage = (divide * 100)?.toFixed(0);

            const remainAmount =
              spendLimitType == budgetLimitTypeEnum.LIMIT
                ? remainingAmount
                : detailsData?.remainingAmount;

            return (
              <div
                key={index}
                onClick={() => handleSetSubCategory(category)}
                className={`py-3 ${
                  index + 1 == headData?.length
                    ? ""
                    : "border-bottom border-dark-white-color"
                } cursor-pointer`}
              >
                <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center justify-content-start">
                    <img
                      src={
                        import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                        icon
                      }
                      alt={headCategory?.title}
                      // className="icon h-38px w-auto"
                      className="w-40px h-40px object-fit-cover br-10"
                    />
                    <div className="ms-3">
                      <div className="mb-1 d-flex gap-2 align-items-center">
                        <h5 className="m-0 fs-18 fw-medium text-capitalize max-w-150px text-break text-truncate">
                          {headCategory?.title}
                        </h5>
                        {spendLimitType == budgetLimitTypeEnum.LIMIT &&
                          maxAmount > 0 && (
                            <span
                              className={`badge ${
                                percentage < 90
                                  ? percentage >= 50
                                    ? "bg-color-squash-orange-lightest text-color-squash-orange"
                                    : "bg-color-lightest-green text-color-green"
                                  : "bg-color-red-lightest text-color-red"
                              }`}
                            >
                              {percentage}%
                            </span>
                          )}
                      </div>
                      <small className="fs-16 fw-medium text-color-monsoon">
                        {capitalizeFirstLetter(period)}:{" "}
                        {currencySymbol +
                          formateAmount({
                            price:
                              spendLimitType == budgetLimitTypeEnum.LIMIT
                                ? maxAmount
                                : 0,
                          })}
                      </small>
                    </div>
                  </div>
                  <div className="d-flex gap-2 align-items-center ms-auto">
                    {percentage > 100 && (
                      <span className="bg-color-red-lightest text-color-red px-2 py-1 br-8 fs-14">
                        Over Spent
                      </span>
                    )}
                    <i className="ri-arrow-right-s-line fs-26 text-color-monsoon"></i>
                  </div>
                </div>
                <div className="progress my-2" style={{ height: "8px" }}>
                  {spendLimitType == budgetLimitTypeEnum.LIMIT && (
                    <div
                      className={`progress-bar ${
                        percentage < 90
                          ? percentage >= 50
                            ? "bg-color-squash-orange"
                            : "bg-color-light-green"
                          : "bg-color-red"
                      }`}
                      role="progressbar"
                      style={{
                        width: `${percentage}%`,
                      }}
                      aria-valuenow={percentage}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  )}
                </div>
                <div className="d-flex justify-content-between">
                  <small>
                    <span className="text-color-monsoon fs-16 fw-medium">
                      Spent
                    </span>
                    :{" "}
                    <span className="fs-16 fw-medium">
                      {currencySymbol + formateAmount({ price: spendAmount })}
                    </span>
                  </small>
                  <small>
                    <span className="text-color-monsoon fs-16 fw-medium">
                      Remain
                    </span>
                    :{" "}
                    <span className="fs-16 fw-medium">
                      {/* {maxAmount - spendAmount} */}
                      {currencySymbol +
                        formateAmount({
                          price:
                            spendLimitType == budgetLimitTypeEnum.LIMIT
                              ? remainAmount
                              : 0,
                        })}
                    </span>
                  </small>
                </div>
              </div>
            );
          })}
        {loading ? (
          <RemainListLoading />
        ) : (
          !loading &&
          !headData?.length && (
            <span className="d-block text-center client-section-bg-color text-color-gray p-2 br-10">
              Oops! No List Yet!
            </span>
          )
        )}
      </div>
    </div>
  );
};

export default RemainList;
