import { Button, Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import { memo, useCallback } from "react";
import { creditDebitEnum, transactionTypeEnum } from "../../../../helpers/enum";
import { formateAmount } from "../../../../helpers/commonFunctions";
import { useSelector } from "react-redux";
import { format, isToday, isYesterday } from "date-fns";
import { IconsImage } from "../../../../data/images";
import { useModalScroll } from "../../../../helpers/customHooks";

const DeleteRecordModal = ({
  isOpen,
  onClose,
  backdropClassName,
  data,
  onConfirm,
}) => {
  const { user } = useSelector((store) => store.Auth);
  const { loading } = useSelector((store) => store.Transaction);
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onClose, onConfirm]);

  return (
    <Modal
      className="z-1200 modal-590px responsive"
      show={isOpen}
      onHide={onClose}
      backdropClassName={backdropClassName}
      centered={true}
    >
      <Modal.Header
        className="px-4 pb-3 border-bottom common-border-color"
        closeButton
      >
        <Modal.Title className="text-capitalize responsive">
          <h5 className="fs-21 mb-1">Remove Record</h5>
          <p className="fs-14 mb-0 text-color-monsoon">
            Do you really want to remove this record?
          </p>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body ref={modalBodyRef}>
        <ul className="p-0 m-0 d-flex flex-column gap-3">
          {data?.map((item, index) => {
            const icon = item?.category?.icon;
            const title = item?.category?.title;
            const creditDebit = item?.creditDebit;
            const toAccountTitle = item?.to?.title;
            const accountTitle =
              creditDebit == creditDebitEnum.DEBIT
                ? toAccountTitle
                : item?.account?.title;
            const date = item?.date ? new Date(item?.date) : new Date();
            const amount = item?.amount;
            const currencySymbol = item?.currency?.symbol;
            const type = item?.type;
            const toAccount = item?.to?.title || "";
            const createdByUser =
              (item?.user?._id !== user?._id && item?.user?.username) || "";
            const color =
              type == transactionTypeEnum.TRANSFER
                ? creditDebit == creditDebitEnum.CREDIT
                  ? "#57CA61"
                  : "#F66263"
                : item?.category?.color || "";
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
                    ? ""
                    : "border-bottom border-dark-white-color pb-3"
                } d-flex align-items-center justify-content-between`}
              >
                <div className="d-flex gap-3 align-items-center">
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
                    className=" category-icon object-fit-cover"
                    style={{ boxShadow: `0px 4px 10px 0px ${color}4D` }}
                  />
                  <div>
                    <h6 className="m-0 p-0 fs-15 truncate-line-1 d-block w-100 pe-4 text-capitalize text-break">
                      {title}
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
                  </div>
                </div>
                <span className="d-flex flex-column align-items-end">
                  <span className="d-block fs-13 fw-medium text-nowrap">
                    {createdByUser}
                  </span>
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
                  <span className="fs-12 text-color-monsoon">
                    {formattedDate} {formattedTime}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
        <div className="d-flex gap-3 mt-4">
          <Button className="light-gray-btn w-100" onClick={onClose}>
            No
          </Button>
          <Button
            disabled={loading}
            className="primary-btn w-100"
            onClick={handleConfirm}
          >
            {loading ? "Deleting..." : "Yes"}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

DeleteRecordModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  backdropClassName: PropTypes.string,
  data: PropTypes.array,
  onConfirm: PropTypes.func,
};

export default memo(DeleteRecordModal);
