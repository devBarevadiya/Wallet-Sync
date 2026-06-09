import { Button } from "react-bootstrap";
import AddEditRecord from "../../../components/admin/modals/AddEditRecord";
import { memo, useCallback, useState } from "react";
import { formateAmount } from "../../../helpers/commonFunctions";
import PropTypes from "prop-types";
import DateFilterModal from "../../../components/admin/modals/DateFilterModal";
import ToggleMenu from "../../../components/admin/ToggleMenu";
import { IconsImage, Image } from "../../../data/images";
import { useDispatch } from "react-redux";
import { analyticsThunk, getAccountThunk } from "../../../store/actions";
import { useSelector } from "react-redux";
import { setChartOrderHide } from "../../../store/dashboard/slice";
import { Link } from "react-router-dom";
import { ADMIN } from "../../../constants/routes";
import {
  analyticsTypeEnum,
  creditDebitEnum,
  transactionTypeEnum,
} from "../../../helpers/enum";
import { format, isToday, isYesterday } from "date-fns";
import { setStateEditData } from "../../../store/transaction/slice";

const LastRecords = ({ data, enumTitle = "", onNoAccount }) => {
  const [recordModel, setRecordModel] = useState(false);
  const [isEditRecord, setIsEditRecord] = useState({});
  const { chartData } = useSelector((store) => store.Dashboard);
  const { data: acountData } = useSelector((store) => store.Account);
  const { user } = useSelector((store) => store.Auth);
  const [isOpen, setIsOpen] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const dispatch = useDispatch();

  const onSuccess = () => {
    dispatch(analyticsThunk(chartData));
    dispatch(getAccountThunk());
  };

  const handleCloseCategoryModal = useCallback(() => {
    setRecordModel(false), setIsEditRecord({});
  }, []);

  const handleOpenDirect = useCallback(() => {
    setRecordModel(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModal(false);
  }, []);

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between border-bottom border-dark-white-color pb-2 pb-sm-3">
        <h6 className="p-0 m-0 fs-18">Last Record</h6>
        <span>
          <ToggleMenu
            onClose={() => setIsOpen(false)}
            onClick={() => setIsOpen((pre) => !pre)}
            isOpen={isOpen}
          >
            <p
              className="text-color-secondary m-0 fs-14 cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
              onClick={() => setIsModal(true)}
            >
              Filter
            </p>
            <p
              className="text-color-secondary m-0 fs-14 cursor-pointer px-3 py-1 hover-primary-bg transition-bg"
              onClick={() => dispatch(setChartOrderHide(enumTitle))}
            >
              Hide
            </p>
            <Link
              to={ADMIN.RECORDS.PATH}
              className="main-text-color fw-normal m-0 fs-14 cursor-pointer px-3 py-1 w-100 d-block hover-primary-bg transition-bg"
            >
              More
            </Link>
          </ToggleMenu>
        </span>
      </div>
      <Button
        className="admin-primary-bg-btn border-color-lightest-primary border w-100 br-10 mt-4 fs-16 responsive"
        onClick={() =>
          !acountData?.length > 0
            ? onNoAccount && onNoAccount()
            : setRecordModel(true)
        }
      >
        <i className="ri-add-large-line me-2"></i>Add Record
      </Button>

      <AddEditRecord
        isOpen={recordModel}
        // item={isEditRecord}
        onHide={handleCloseCategoryModal}
        onSuccess={onSuccess}
        onDeleteSuccess={onSuccess}
        open={handleOpenDirect}
      />

      <DateFilterModal
        enumValue={analyticsTypeEnum.BUDGET}
        isShow={isModal}
        onHide={handleCloseModal}
      />

      {data?.length ? (
        <ul className="d-flex flex-column mt-2 p-0 m-0">
          {data?.map((item, index) => {
            const icon = item?.category?.icon;
            const creditDebit = item?.creditDebit;
            const title = item?.category?.title;
            const date = new Date(item?.date);
            const amount = item?.amount;
            const currencySymbol = item?.currency?.symbol;
            const type = item?.type;
            const toAccountTitle = item?.to?.title;
            const toAccount = item?.to?.title || "";
            const createdByUser =
              (item?.user?._id !== user?._id && item?.user?.username) || "";
            const color =
              type == transactionTypeEnum.TRANSFER
                ? creditDebit == creditDebitEnum.CREDIT
                  ? "#57CA61"
                  : "#F66263"
                : item?.category?.color || "";
            const note = item?.note;
            const payee = item?.payee?.name || "";
            const labels = item?.labels;
            const accountTitle =
              creditDebit == creditDebitEnum.DEBIT
                ? toAccountTitle
                : item?.account?.title;

            const formattedDate = isToday(date)
              ? "Today"
              : isYesterday(date)
              ? "Yesterday"
              : format(date, "dd MMM yyyy");

            const formattedTime = format(date, "h:mm a");

            return (
              <li
                key={index}
                className={`${
                  data?.length == index + 1
                    ? "pt-3"
                    : "border-bottom border-dark-white-color py-3"
                } d-flex align-items-cente justify-content-between cursor-pointer`}
                onClick={() => {
                  setRecordModel(true),
                    setIsEditRecord(item),
                    dispatch(setStateEditData(item));
                }}
              >
                <div className="d-flex gap-3">
                  <img
                    src={
                      type == transactionTypeEnum.TRANSFER
                        ? creditDebit == creditDebitEnum.CREDIT
                          ? IconsImage.other.creditTransferIcon
                          : IconsImage.other.debitTransferIcon
                        : import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                          icon
                    }
                    alt=""
                    className="category-icon object-fit-cover"
                    style={{ boxShadow: `0px 4px 10px 0px ${color}4D` }}
                  />
                  <div>
                    <h6 className="m-0 p-0 fs-15 truncate-line-1 text-break pe-4 text-capitalize">
                      {type == transactionTypeEnum.TRANSFER
                        ? "Transfer"
                        : title}
                    </h6>
                    <span className="fs-14 text-color-monsoon text-capitalize max-w-300px truncate-line-1 text-break d-block mt-1">
                      {/* {accountTitle} */}
                      {type == transactionTypeEnum.TRANSFER ? (
                        <span>
                          <span
                            className={`${
                              creditDebit == creditDebitEnum.DEBIT
                                ? ""
                                : "text-color-light-gray"
                            }`}
                          >
                            {item?.account?.title}{" "}
                          </span>
                          <i className="ri-arrow-right-long-fill"></i>{" "}
                          <span
                            className={`${
                              creditDebit == creditDebitEnum.DEBIT
                                ? "text-color-light-gray"
                                : ""
                            }`}
                          >
                            {toAccount}
                          </span>
                        </span>
                      ) : (
                        item?.account?.title
                      )}
                    </span>
                    {createdByUser && (
                      <span className="fs-13 text-color-monsoon text-capitalize max-w-300px truncate-line-1 text-break d-block mt-1">
                        By: {createdByUser}
                      </span>
                    )}
                    {note && (
                      <span className="fs-13 text-color-monsoon text-capitalize max-w-300px truncate-line-1 text-break d-block mt-1">
                        Note: {note}
                      </span>
                    )}
                    {payee && (
                      <span className="fs-13 text-color-monsoon text-capitalize max-w-300px text-break truncate-line-1 d-block mt-1">
                        Payer: {payee}
                      </span>
                    )}
                    {labels?.length > 0 && (
                      <ul className="p-0 m-0 d-flex align-items-center gap-2 mt-2 flex-wrap">
                        {labels?.map((item, index) => {
                          return (
                            <li
                              key={index}
                              style={{
                                backgroundColor: item?.color,
                              }}
                              className="fs-12 text-white px-2 py-1 br-5 max-w-300px d-block truncate-line-1 text-break"
                            >
                              {item?.title}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
                <span className="d-flex flex-column align-items-end">
                  {/* <span className="d-block fs-13 fw-medium text-nowrap">
                    {createdByUser}
                  </span> */}
                  <span
                    className={`${
                      type == transactionTypeEnum.INCOME ||
                      creditDebit == creditDebitEnum.CREDIT
                        ? "text-color-light-green"
                        : type == transactionTypeEnum.EXPENSE ||
                          creditDebit == creditDebitEnum.DEBIT
                        ? "text-color-invalid"
                        : ""
                    } fs-15 fw-medium text-nowrap`}
                  >
                    {type == transactionTypeEnum.INCOME ||
                    creditDebit == creditDebitEnum.CREDIT
                      ? "+ "
                      : type == transactionTypeEnum.EXPENSE ||
                        creditDebit == creditDebitEnum.DEBIT
                      ? "- "
                      : ""}
                    {currencySymbol + formateAmount({ price: amount })}
                  </span>
                  <span className="fs-12 text-color-silver-sand text-end text-nowrap ms-3">
                    {formattedDate} {formattedTime}
                  </span>
                </span>
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
  );
};

LastRecords.propTypes = {
  data: PropTypes.array,
  enumTitle: PropTypes.string,
  onNoAccount: PropTypes.func,
};

export default memo(LastRecords);
