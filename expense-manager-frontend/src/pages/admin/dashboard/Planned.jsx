import PropTypes from "prop-types";
import {
  formateAmount,
} from "../../../helpers/commonFunctions";
import { analyticsTypeEnum, transactionTypeEnum } from "../../../helpers/enum";
import { memo, useCallback, useState } from "react";
import ToggleMenu from "../../../components/admin/ToggleMenu";
import { setChartOrderHide } from "../../../store/dashboard/slice";
import { Link } from "react-router-dom";
import { ADMIN } from "../../../constants/routes";
import { useDispatch } from "react-redux";
import DateFilterModal from "../../../components/admin/modals/DateFilterModal";
import { Image } from "../../../data/images";
import EditPlannedModal from "../../../components/admin/modals/plannedPaymentModals/EditPlannedModal";
import PlannedPaymentModal from "../../../components/admin/modals/plannedPaymentModals/PlannedPaymentModal";
import { analyticsThunk, getAccountThunk } from "../../../store/actions";
import { useSelector } from "react-redux";

const Planned = ({ data = [], enumTitle = "" }) => {
  const { chartData } = useSelector((store) => store.Dashboard);

  const [isOpen, setIsOpen] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [isDateModal, setIsDateModal] = useState(false);
  const [isEditModal, setIsEditModal] = useState(false);
  const [editData, setEditData] = useState({});

  const dispatch = useDispatch();

  const getDaysLeft = useCallback((value) => {
    const today = new Date();
    const target = new Date(value);

    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const difference = target - today;
    return Math.round(difference / (1000 * 60 * 60 * 24));
  }, []);

  const handleOpenEditModal = useCallback(() => {
    setIsEditModal(true);
  }, []);

  const handleEditData = useCallback((values) => {
    setEditData(values), handleOpenEditModal();
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModal(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModal(false);
  }, []);

  const handleSubModalOpen = useCallback(() => {
    handleCloseModal();
  }, []);

  const handleOpenModal = useCallback(() => {
    setIsModal(true);
  }, []);

  const handleClearEditData = useCallback(async () => {
    setEditData({});
    await dispatch(analyticsThunk(chartData));
  }, [chartData, dispatch]);

  const handleConfirmPayment = useCallback(async () => {
    await dispatch(getAccountThunk());
    await dispatch(analyticsThunk(chartData));
  }, [chartData]);

  return (
    <div className="responsive">
      <div className="d-flex align-items-center justify-content-between border-bottom border-dark-white-color pb-2 pb-sm-3">
        <h6 className="p-0 m-0 fs-18">Planned Payment</h6>
        <span>
          <ToggleMenu
            onClose={() => setIsOpen(false)}
            onClick={() => setIsOpen((pre) => !pre)}
            isOpen={isOpen}
          >
            {/* <p
              className="text-color-secondary m-0 fs-14 cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
              onClick={() => setIsDateModal(true)}
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
              to={ADMIN.PLANNED_PAYMENT.PATH}
              className="main-text-color fw-normal m-0 fs-14 cursor-pointer px-3 py-1 w-100 d-block hover-primary-bg transition-bg"
            >
              More
            </Link>
          </ToggleMenu>
        </span>
      </div>
      <div className="d-flex flex-column">
        {data?.length > 0 ? (
          data?.map((item, index) => {
            const icon =
              import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
              item?.category?.icon;
            const title = item?.title;
            const categoryTitle = item?.category?.title;
            const type = item?.type;
            const currencySymbol = item?.account?.currency?.symbol;
            const amount = item?.amount;
            const nextPaymentDate = item?.nextPaymentDate;
            const timeDifference = getDaysLeft(nextPaymentDate);
            const color = item?.category?.color || "";

            return (
              <div
                key={index}
                onClick={() => handleEditData(item)}
                className={`py-3 border-0 ${
                  index + 1 == data?.length ? "pb-0" : "border-bottom"
                } border-dark-white-color d-flex  align-items-center justify-content-between cursor-pointer`}
              >
                <div>
                  <div className="d-flex gap-3">
                    <img
                      style={{ boxShadow: `0px 4px 10px 0px ${color}4D` }}
                      src={icon}
                      className="category-icon"
                      alt=""
                    />
                    <span>
                      <h6 className="p-0 m-0 fs-16 text-capitalize max-w-300px text-break truncate-line-1 pe-5">
                        {title}
                      </h6>
                      <span className="fs-13 me-3 text-color-light-gray text-capitalize max-w-300px text-break truncate-line-1 d-block mt-1">
                        {categoryTitle}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="ms-auto">
                  <div className="d-flex text-end justify-content-end align-items-center gap-2">
                    <span>
                      <span
                        className={`${
                          type == transactionTypeEnum.INCOME
                            ? "text-color-light-green"
                            : type == transactionTypeEnum.EXPENSE
                            ? "text-color-invalid"
                            : ""
                        } fs-16 fw-semibold text-nowrap`}
                      >
                        {type == transactionTypeEnum.INCOME
                          ? amount > 0
                            ? "+ "
                            : ""
                          : type == transactionTypeEnum.EXPENSE
                          ? amount > 0
                            ? "- "
                            : ""
                          : ""}
                        {currencySymbol + formateAmount({ price: amount })}
                      </span>
                      {nextPaymentDate ? (
                        <span className="fs-12 text-nowrap text-color-silver-sand text-capitalize d-block">
                          {` ${
                            timeDifference > 0
                              ? timeDifference == 1
                                ? "Tommorow"
                                : `in ${timeDifference} days`
                              : timeDifference == 0
                              ? "Today"
                              : `${0 - timeDifference} Days overdue`
                          }`}
                        </span>
                      ) : (
                        <span className="fs-13 text-color-gray text-capitalize d-block">
                          Ended
                        </span>
                      )}
                    </span>
                    <i className="ri-arrow-right-s-line fs-28"></i>
                  </div>
                </div>
              </div>
            );
          })
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
        enumValue={analyticsTypeEnum.PLANNED}
        isShow={isDateModal}
        onHide={() => setIsDateModal(false)}
      /> */}

      <PlannedPaymentModal
        isOpen={isModal}
        onClose={handleCloseModal}
        open={handleOpenModal}
        editData={editData}
        onSuccess={handleClearEditData}
      />

      <EditPlannedModal
        isOpen={isEditModal}
        onClose={handleCloseEditModal}
        editData={editData}
        open={handleOpenEditModal}
        handleOpenSubModal={handleSubModalOpen}
        handleClickOnEdit={handleOpenModal}
        onSuccess={handleConfirmPayment}
      />
    </div>
  );
};

Planned.propTypes = {
  data: PropTypes.array,
  enumTitle: PropTypes.string,
};

export default memo(Planned);
