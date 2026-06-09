import React, { memo, useState } from "react";
import { BudgetData } from "../../../data/admin/budget/data";
import BudgetChart from "./BudgetChart";
import {
  capitalizeFirstLetter,
  formateAmount,
} from "../../../helpers/commonFunctions";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  budgetDetailsThunk,
  budgetTransactionsThunk,
} from "../../../store/actions";
import { formatDate } from "date-fns";
import { budgetRolloverUserResponse, periodEnum } from "../../../helpers/enum";
import Rollover from "./Rollover";

const BudgetCard = ({ type, data = {} }) => {
  // Extract createdAt from BudgetData
  const createdAt = new Date(BudgetData.data.createdAt);
  const { detailsData, loading, filterData } = useSelector(
    (store) => store.Budget
  );
  const { baseCurrency } = useSelector((store) => store.Auth);
  const currencySymbol = baseCurrency?.symbol;
  const dispatch = useDispatch();

  // Get the current date
  const currentDate = new Date();

  //   "rollover": {
  //     "generatedAmount": 0,
  //     "acceptedAmount": 0,
  //     "userResponse": "ACCEPTED"
  // },

  // Set the initial state based on the createdAt date
  const headData = data?.headCategories || [];
  const prevBudget = data?.prevBudget;
  const nextBudget = data?.nextBudget;
  const maxAmount = data?.maxAmount;
  const period = data?.period;
  const spendAmount = data?.spendAmount;

  const rolloverAmount = data?.rollover?.generatedAmount;
  // const rolloverAcceptedAmount = data?.rollover?.acceptedAmount;
  const rolloverResponse = data?.rollover?.userResponse;
  // const rolloverResponse = data?.rollover?.userResponse;

  const createdAtDate = data?.createdAt
    ? new Date(data?.createdAt)
    : new Date();
  const [currentViewDate, setCurrentViewDate] = useState(createdAt);

  let dateFormating = {};

  if (period == periodEnum.WEEKLY || period == periodEnum.MONTHLY) {
    const endDate = new Date(createdAtDate);
    endDate.setDate(createdAtDate.getDate() + 6);
    const nextMonthDate = new Date(createdAtDate);
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

    dateFormating = {
      startDate: formatDate(createdAtDate, "d-M-yyyy"),
      endDate: formatDate(
        period == periodEnum.WEEKLY ? endDate : nextMonthDate,
        "d-M-yyyy"
      ),
    };
  } else if (period == periodEnum.YEARLY) {
    const nextYearDate = new Date(createdAtDate);
    nextYearDate.setMonth(nextYearDate.getFullYear() + 1);

    dateFormating = {
      startDate: formatDate(createdAtDate, "M-yyyy"),
      endDate: formatDate(nextYearDate, "M-yyyy"),
    };
  }

  // Function to navigate to the previous month
  const goToPreviousMonth = async () => {
    const newDate = new Date(currentViewDate);
    newDate.setMonth(currentViewDate.getMonth() - 1);
    setCurrentViewDate(newDate);
    !loading && dispatch(budgetDetailsThunk(prevBudget));
    !loading &&
      dispatch(
        budgetTransactionsThunk({
          id: prevBudget,
          values: { page: 1, ...filterData },
        })
      );
  };

  // Function to navigate to the next month
  const goToNextMonth = () => {
    const newDate = new Date(currentViewDate);
    newDate.setMonth(currentViewDate.getMonth() + 1);
    setCurrentViewDate(newDate);
    !loading && dispatch(budgetDetailsThunk(nextBudget));
    !loading &&
      dispatch(
        budgetTransactionsThunk({
          id: nextBudget,
          values: { page: 1, ...filterData },
        })
      );
  };

  // Format the date as "Month Year" (e.g., "November 2024")
  const formattedDate = currentViewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Function to calculate the percentage of spendAmount relative to maxAmount
  const calculatePercentage = (spendAmount, maxAmount) => {
    if (maxAmount === 0) return 0;
    return ((spendAmount / maxAmount) * 100).toFixed(0);
  };

  const budgetMaxAmount = BudgetData.data.maxAmount;
  const budgetSpendAmount = BudgetData.data.spendAmount;
  const budgetPeriod = BudgetData.data.period;

  // Disable the previous button if we're at or before the createdAt month
  const disablePreviousButton = currentViewDate <= createdAt;

  // Disable the next button if we're at the current month (i.e., can't navigate past today)
  const disableNextButton =
    currentViewDate.getMonth() === currentDate.getMonth() &&
    currentViewDate.getFullYear() === currentDate.getFullYear();

  return (
    <div className="responsive common-light-primary-shadow border common-border-color br-20 budgetCard card pt-0 mb-3 bg-white rounded overflow-hidden">
      <div className="overflow-scroll-design  budget-card-height">
        <div className="card-body p-4 pt-0">
          {/* Month navigation */}
          <div className="position-sticky pt-3 top-0 bg-white">
            <div className="">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <button
                  className={`btn p-0 border-0 ${
                    prevBudget == null ? "text-color-monsoon" : "cursor-pointer"
                  }`}
                  onClick={goToPreviousMonth}
                  disabled={prevBudget == null}
                  aria-label="Previous month"
                >
                  <i className="ri-arrow-left-s-line fs-28"></i>
                </button>
                <span>
                  {period == periodEnum.ONE_TIME ? (
                    // <span className="fs-21 fw-medium">{dateFormating}</span>
                    <span className="fs-21 fw-medium">One Time</span>
                  ) : (
                    <span className="fs-16 text-color-monsoon ">
                      {dateFormating.startDate}
                      <span className="main-text-color"> To </span>
                      {dateFormating.endDate}
                    </span>
                  )}
                </span>

                <button
                  className={`btn p-0 border-0 ${
                    prevBudget == null ? "text-color-monsoon" : "cursor-pointer"
                  }`}
                  onClick={goToNextMonth}
                  disabled={nextBudget == null}
                  aria-label="Next month"
                >
                  <i className="ri-arrow-right-s-line fs-28"></i>
                </button>
              </div>

              {/* Show BudgetChart for the current month */}
              {rolloverResponse == budgetRolloverUserResponse.PENDING &&
              type !== "plan" ? (
                ""
              ) : (
                <BudgetChart
                  spendAmount={loading ? 0 : spendAmount}
                  maxAmount={loading ? 1 : maxAmount}
                  type={type}
                  currency={currencySymbol}
                  period={period}
                />
              )}
            </div>
          </div>

          {/* Category data display */}
          {type === "plan" ? (
            <div className="mt-3 budget-chart-head-height overflow-scroll-design">
              {!loading &&
                headData?.map((item, index) => {
                  const color = item?.headCategory?.color || "#FA6838";
                  const percentage = calculatePercentage(
                    item.spendAmount,
                    detailsData.maxAmount
                  );

                  return (
                    <div
                      key={index}
                      className="d-flex justify-content-between align-items-start mb-3"
                    >
                      <div className="d-flex align-items-start justify-content-center gap-2">
                        {/* Category Image */}
                        {/* <img
                      src={item.headCategory.icon}
                      alt={item.headCategory.title}
                      className="category-image object-fit-contain"
                    /> */}
                        <span
                          className="h-20px w-20px br-5"
                          style={{ backgroundColor: color }}
                        ></span>
                        {/* Category Title */}
                        <div className="d-flex flex-column">
                          <span className="fw-medium fs-16 text-capitalize max-w-300px truncate-line-1 lh-1 text-break me-4">
                            {item?.headCategory?.title}
                          </span>

                          <span
                            className="text-black text-color-monsoon mt-1 fs-14 fw-medium"
                            style={{
                              color: item?.headCategory?.color || "#FA6838",
                            }}
                          >
                            {/* Showing percentage instead of spend/max */}
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      {/* <span className="border-start-0 border-end-0 border-bottom-0 border p-1 w-100 mx-2 common-border-color mt-2 border-dashed"></span> */}
                      {/* Spend and Remaining Amount */}
                      <div>
                        <span className="text-black ms-2 fw-medium fs-16">
                          {currencySymbol +
                            formateAmount({ price: item.spendAmount })}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : rolloverResponse == budgetRolloverUserResponse.PENDING ? (
            <Rollover currencySymbol={currencySymbol} />
          ) : (
            <div className="d-flex justify-content-center align-items-center text-center pt-3">
              <div className="d-flex flex-column border-end common-border-color pe-4">
                <span className="fs-16 text-color-monsoon fw-400">Spent</span>
                <span className="fs-22 fw-medium">
                  {currencySymbol +
                    formateAmount({ price: loading ? 0 : spendAmount })}
                </span>
              </div>
              <div className="d-flex flex-column ps-4">
                <span className="fs-16 text-color-monsoon fw-400">
                  {capitalizeFirstLetter(period)}
                </span>
                <span className="fs-22 fw-medium">
                  {currencySymbol +
                    formateAmount({ price: loading ? 0 : maxAmount })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(BudgetCard);
