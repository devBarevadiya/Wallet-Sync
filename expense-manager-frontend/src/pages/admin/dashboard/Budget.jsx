import PropTypes from "prop-types";
import { memo, useCallback, useState } from "react";
import ToggleMenu from "../../../components/admin/ToggleMenu";
import DateFilterModal from "../../../components/admin/modals/DateFilterModal";
import { useSelector } from "react-redux";
import {
  capitalizeFirstLetter,
  formateAmount,
} from "../../../helpers/commonFunctions";
import { useDispatch } from "react-redux";
import { setShowSubCategories } from "../../../store/budget/slice";
import { Link, useNavigate } from "react-router-dom";
import { ADMIN } from "../../../constants/routes";
import { setChartOrderHide } from "../../../store/dashboard/slice";
import { Image } from "../../../data/images";
import { analyticsTypeEnum } from "../../../helpers/enum";

const Budget = ({ data = [], enumTitle = "" }) => {
  const { baseCurrency } = useSelector((store) => store.Auth);
  const [isOpen, setIsOpen] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const nav = useNavigate();
  // const color = ["#6BC127", "#C75DE1", "#FFB800"];
  const currencySymbol = baseCurrency?.symbol;
  const dispatch = useDispatch();

  const handleDetailsPage = useCallback((id) => {
    dispatch(setShowSubCategories({}));
    nav(`${ADMIN.BUDGET_DETAILS.PATH}/${id}`);
  }, [dispatch, nav]);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between  border-bottom common-border-color pb-2 pb-sm-3">
        <h6 className="p-0 m-0 fs-18">Budget</h6>
        <span>
          <ToggleMenu
            onClose={() => setIsOpen(false)}
            onClick={() => setIsOpen((pre) => !pre)}
            isOpen={isOpen}
          >
            {/* <p
              className="text-color-secondary m-0 fs-14 cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
              onClick={() => setIsModal(true)}
            >
              Filter
            </p> */}
            <p
              className="text-color-secondary m-0 fs-14 cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
              onClick={() => dispatch(setChartOrderHide(enumTitle))}
            >
              Hide
            </p>
            <Link
              to={ADMIN.BUDGET.PATH}
              className="main-text-color fw-normal m-0 fs-14 cursor-pointer px-3 py-1 w-100 d-block hover-primary-bg transition-bg"
            >
              More
            </Link>
          </ToggleMenu>
        </span>
      </div>
      {/* <div className="d-flex flex-column gap-3 mt-3"> */}
      <div className="">
        {data?.length > 0 ? (
          <ul className="p-0 m-0">
            {data?.map((item, index) => {
              const title = item?.name || 0;
              const amount = item?.maxAmount || 0;
              const spend = item?.spendAmount || 0;
              const remain = item?.remainingAmount || 0;
              const period = item?.period;
              const usedPercent = Math.round((spend / amount) * 100) || 0;
              return (
                <li
                  key={index}
                  className={`${
                    data?.length == index + 1
                      ? "pt-3"
                      : "border-bottom border-dark-white-color py-3"
                  }`}
                >
                  <div
                    className="d-flex align-items-center justify-content-between cursor-pointer"
                    // onClick={() => {
                    //   setRecordModel(true), setIsEditRecord(item);
                    // }}
                    onClick={() => handleDetailsPage(item?._id)}
                  >
                    <div className="d-flex w-100 flex-wrap gap-2 justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center justify-content-start">
                        <img
                          src="https://guardianshot.blr1.digitaloceanspaces.com/expense/avatar/e55ed62e-e51d-4367-83db-bc0a918c81c9.png"
                          alt={"budget-icon"}
                          // className="icon h-38px w-auto"
                          className="category-icon object-fit-cover"
                          style={{ boxShadow: `0px 4px 10px 0px #A651FB4D` }}
                        />
                        <div className="ms-3">
                          <div className="mb-1 d-flex gap-2 align-items-center">
                            <h5 className="m-0 fs-18 fw-medium text-capitalize max-w-150px text-break truncate-line-1">
                              {title}
                            </h5>

                            <span
                              className={`badge ${
                                usedPercent < 90
                                  ? usedPercent >= 50
                                    ? "bg-color-squash-orange-lightest text-color-squash-orange"
                                    : "bg-color-lightest-green text-color-green"
                                  : "bg-color-red-lightest text-color-red"
                              }`}
                            >
                              {usedPercent}%
                            </span>
                          </div>
                          <small className="fs-16 fw-medium text-color-monsoon">
                            {capitalizeFirstLetter(period)}
                          </small>
                        </div>
                      </div>
                      <div className="d-flex flex-sm-column gap-2 align-items-center ms-auto">
                        {usedPercent > 100 && (
                          <span className="bg-color-red-lightest text-color-red px-2 py-1 br-8 fs-14">
                            Over Spent
                          </span>
                        )}
                        <span className="client-section-bg-color px-3 border border-dark-white-color py-2 br-8 fs-14 fw-medium">
                          {currencySymbol +
                            formateAmount({
                              price: spend,
                            })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="">
                    {/* <div className="d-flex p-0 m-0  justify-content-between mt-1">
                    <h5 className="p-0 m-0 fs-15 fw-normal">
                      {currencySymbol + formateAmount({ price: amount })}
                    </h5>
                    <span className="fs-15 fw-normal">{usedPercent}%</span>
                  </div> */}
                    <div className="progress mb-2" style={{ height: "10px" }}>
                      {
                        <div
                          className={`progress-bar br-5 ${
                            usedPercent < 90
                              ? usedPercent >= 50
                                ? "bg-color-squash-orange"
                                : "bg-color-light-green"
                              : "bg-color-red"
                          }`}
                          role="progressbar"
                          style={{
                            width: `${usedPercent}%`,
                          }}
                          aria-valuenow={usedPercent}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      }
                    </div>
                    <div className="d-flex p-0 m-0  justify-content-between">
                      <span className="p-0 m-0 fs-15">
                        <span className="text-color-monsoon fw-normal">
                          Spent:{" "}
                        </span>
                        <span className="fw-medium">
                          {currencySymbol + formateAmount({ price: spend })}
                        </span>
                      </span>
                      <span className="fs-15">
                        <span className="text-color-monsoon">Remain: </span>
                        <span className="fw-medium">
                          {currencySymbol + formateAmount({ price: remain })}
                        </span>
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="h-100 d-flex flex-column align-items-center justify-content-center">
            <img
              src={Image.noRecordImg}
              className="mx-auto d-block mt-3 w-150px"
              alt=""
              style={{ display: "inline-block" }}
            />
            <p className="text-color-light-gray mt-2 fs-14 mb-2">
              There are no data in the selected time interval.
            </p>
          </div>
        )}
      </div>
      {/* <DateFilterModal
        enumValue={analyticsTypeEnum.BUDGET}
        isShow={isModal}
        onHide={() => setIsModal(false)}
      /> */}
    </div>
  );
};

Budget.propTypes = {
  data: PropTypes.array,
  enumTitle: PropTypes.string,
};

export default memo(Budget);
