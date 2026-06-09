import { memo, useCallback, useEffect, useState } from "react";
import {
  capitalizeFirstLetter,
  formateAmount,
} from "../../../helpers/commonFunctions";
import { useDispatch } from "react-redux";
import {
  setSelectedSubCategory,
  setShowSubCategories,
} from "../../../store/budget/slice";
import { useSelector } from "react-redux";
import { budgetLimitTypeEnum } from "../../../helpers/enum";
import CategoryModal from "../modals/budgetModals/CategoryModal";
import { getCategoryThunk } from "../../../store/actions";

const SubCategoryRemainList = ({ data = [], editData }) => {
  const { showSubCategories, detailsData, selectedSubCategory } = useSelector(
    (store) => store.Budget
  );
  const { data: categories, loading } = useSelector((state) => state.Category);
  const { baseCurrency } = useSelector((store) => store.Auth);
  const [isModal, setIsModal] = useState(false);
  const [editvalue, setEditValue] = useState({});
  const currencySymbol = baseCurrency?.symbol;
  const dispatch = useDispatch();

  const headCategory = showSubCategories?.headCategory;

  const subCategory = showSubCategories?.categories?.filter(
    (item) => item?._id
  );
  const period = data?.period || "";
  const maxHeadAmount = showSubCategories?.maxAmount;

  const [filterHead] = data?.headCategories?.filter(
    (item) => item?.headCategory?._id == headCategory?._id
  ) || [{}];

  const [findHeadFromState] = categories?.filter(
    (item) => item?._id == headCategory?._id
  ) || [{}];

  const setCategory = new Set(subCategory?.map((item) => item?._id));

  const newCategories = findHeadFromState?.categories?.filter(
    (item) => !setCategory.has(item?.category?._id)
  );

  const updatedCategories = newCategories?.map(
    (item) =>
      item?._id === selectedSubCategory?.category
        ? { ...item, ...selectedSubCategory } // Replace the matching object
        : item // Keep other objects unchanged
  );

  const handleOpenModal = useCallback((value) => {
    // setEditValue(value);
    setIsModal(true);
  }, []);

  const handlCloseModal = useCallback(() => {
    // setEditValue({});
    setIsModal(false);
  }, []);

  // const subTotal = useMemo(
  //   () => subCategory?.reduce((acc, curr) => Number(curr?.maxAmount) + acc, 0),
  //   [subCategory]
  // );

  useEffect(() => {
    if (!categories?.length) {
      dispatch(getCategoryThunk());
    }
  }, []);

  return (
    <>
      <div className="responsive common-light-primary-shadow border overflow-hidden common-border-color br-20 budgetCategory card pt-0 mb-3 bg-white rounded">
        <div className="overflow-scroll-design budget-card-height p-20px p-sm-4 pt-0 pt-sm-0">
          <div className="card-header position-sticky pt-4 px-0 top-0  bg-white border-bottom border-dark-white-color">
            <h5 className="fs-21 fw-medium text-capitalize">
              <i
                onClick={() => dispatch(setShowSubCategories({}))}
                className="ri-arrow-left-line me-2 cursor-pointer"
              ></i>
              {headCategory?.title}
            </h5>
          </div>{" "}
          {subCategory?.length ? (
            subCategory?.map((category, index) => {
              const icon = category?.category?.icon;
              const {
                maxAmount: amount = 0,
                remainingAmount = 0,
                spendAmount = 0,
                spendLimitType = "",
              } = category;

              const maxAmount =
                spendLimitType == budgetLimitTypeEnum.LIMIT
                  ? amount
                  : showSubCategories?.remainingAmount || 0;
              // : maxHeadAmount?.maxAmount - subTotal || 0;

              const divide =
                spendAmount /
                  (spendLimitType == budgetLimitTypeEnum.LIMIT
                    ? maxAmount
                    : maxHeadAmount?.maxAmount) || 0;
              const percentage = (divide * 100)?.toFixed(0);

              const remainAmount =
                spendLimitType == budgetLimitTypeEnum.LIMIT
                  ? remainingAmount
                  : showSubCategories?.remainingAmount;

              return (
                <div
                  key={index}
                  className={`py-3 border-bottom border-dark-white-color`}
                >
                  <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center justify-content-start">
                      <img
                        src={
                          import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                          icon
                        }
                        alt={category?.category?.title}
                        // className="icon h-38px w-auto"
                        className="w-40px h-40px object-fit-cover br-10"
                      />
                      <div className="ms-2 ms-sm-3">
                        <div className="mb-1 d-flex flex-wrap gap-1 gap-sm-2 align-items-center">
                          <h5 className="m-0 fs-18 fw-medium text-capitalize max-w-150px text-break text-truncate">
                            {category?.category?.title}
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
                          {capitalizeFirstLetter(period)}
                        </small>
                      </div>
                    </div>

                    <div className="d-flex  flex-sm-column align-items-end gap-2 ms-auto">
                      {percentage > 100 && (
                        <span className="bg-color-red-lightest text-color-red px-2 py-1 br-8 fs-14">
                          Over Spent
                        </span>
                      )}
                      <span className="client-section-bg-color px-3 border border-dark-white-color py-2 br-8 fs-14 fw-medium">
                        {currencySymbol +
                          formateAmount({
                            price:
                              spendLimitType == budgetLimitTypeEnum.LIMIT
                                ? maxAmount
                                : 0,
                          })}
                      </span>
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
            })
          ) : (
            <span className="d-block text-center client-section-bg-color text-color-gray p-2 br-10">
              {loading ? "Fetching..." : "Oops! no category yet!"}
            </span>
          )}
          <span
            onClick={handleOpenModal}
            className="fs-16 cursor-pointer text-center text-color-monsoon border-0 py-12px list-group-item border-bottom border-dark-white-color rounded-0"
          >
            Add Sub Category
          </span>
        </div>
        <CategoryModal
          isOpen={isModal}
          onClose={handlCloseModal}
          data={newCategories}
          method="addExtra"
          newCategories={findHeadFromState?.categories}
          headCategory={{
            headCategory: filterHead?.headCategory?._id,
            spendLimitType: filterHead?.spendLimitType,
            categories: filterHead?.categories,
          }}
          open={handleOpenModal}
          close={handlCloseModal}
        />
      </div>
    </>
  );
};

export default memo(SubCategoryRemainList);
