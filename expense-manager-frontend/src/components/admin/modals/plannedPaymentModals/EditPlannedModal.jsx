import PropTypes from "prop-types";
import { memo, useCallback, useEffect, useState } from "react";
import { Button, Modal, Placeholder } from "react-bootstrap";
import {
  paymentStatusEnum,
  transactionTypeEnum,
} from "../../../../helpers/enum";
import { formatDate, formateAmount } from "../../../../helpers/commonFunctions";
import EditGeneralDetailsModal from "./EditGeneralDetailsModal";
import {
  getAllPaymentPlannedThunk,
  paymentPlannedPaginationThunk,
} from "../../../../store/payment/thunk";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { getPlannedByFiltersThunk } from "../../../../store/planned/thunk";
import { useModalScroll } from "../../../../helpers/customHooks";

const EditPlannedModal = ({
  isOpen,
  onClose,
  editData,
  open,
  handleOpenSubModal,
  handleClickOnEdit,
  onSuccess,
}) => {
  const {
    data: paymentData,
    loading,
    pagination,
  } = useSelector((state) => state.Payment);
  const { pagination: plannedPagination, filterOptions } = useSelector(
    (store) => store.Planned
  );

  const [currentSubModal, setCurrentSubModal] = useState("");
  const [subEditData, setSubEditData] = useState({});
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const getDaysLeft = useCallback((value) => {
    const today = new Date();
    const target = new Date(value);

    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const difference = target - today;
    return Math.round(difference / (1000 * 60 * 60 * 24));
  }, []);

  const dispatch = useDispatch();

  const editId = editData?._id;
  const title = editData?.title;
  const categoryTitle = editData?.category?.title;
  const type = editData?.type;
  const currencySymbol = editData?.account?.currency?.symbol;
  const amount = editData?.amount;
  const icon =
    import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
    editData?.category?.icon;
  const scheduleType =
    typeof editData?.scheduleType === "string"
      ? editData.scheduleType.split("_")
      : [];
  const accountTitle = editData?.account?.title;
  const labelCount = editData?.labels?.length || 0;
  const note = editData?.note;
  // const nextPaymentDate = editData?.nextPaymentDate;
  // const timeDifference = getDaysLeft(nextPaymentDate);
  const page = pagination.page;
  const totalPages = pagination.totalPages;

  const data = [
    {
      title: "repeat",
      value:
        scheduleType.length > 0 ? scheduleType.join(" ") : "No schedule type",
    },
    {
      title: "account",
      value: accountTitle,
    },
    {
      title: "payment name",
      value: title,
    },
    {
      title: "labels",
      value:
        labelCount > 0
          ? labelCount > 1
            ? `${labelCount} labels`
            : `${labelCount} label`
          : "No label",
    },
    {
      title: "note",
      value: note || "---",
    },
  ];

  // const handleClose = useCallback(() => {

  // }, []);

  const handleOpenSubModalFunc = useCallback(
    (value) => {
      setCurrentSubModal("editDetails");
      handleOpenSubModal(value);
      onClose();
    },
    [handleOpenSubModal, onClose]
  );

  const handleCloseSubModal = useCallback(() => {
    open();
    setCurrentSubModal("");
  }, [open]);

  const handleCloseDirectly = useCallback(() => {
    setCurrentSubModal("");
  }, []);

  const handleEditSubDataModal = useCallback(
    (value) => {
      setSubEditData(value);
      setCurrentSubModal("editDetails");
      onClose();
    },
    [onClose]
  );

  const handlePaymentConfirm = useCallback(async () => {
    await dispatch(getAllPaymentPlannedThunk(editId));
    dispatch(
      getPlannedByFiltersThunk({
        ...filterOptions,
        page: plannedPagination?.page,
      })
    );
    onSuccess && onSuccess();
    handleOpenSubModalFunc();
  }, [
    editId,
    handleOpenSubModalFunc,
    dispatch,
    filterOptions,
    onSuccess,
    plannedPagination,
  ]);

  const handleEdit = useCallback(() => {
    handleClickOnEdit();
  }, []);

  const handlePagination = () => {
    dispatch(paymentPlannedPaginationThunk({ id: editId, page: page + 1 }));
  };

  const getAllPayment = useCallback(async () => {
    await dispatch(getAllPaymentPlannedThunk(editId));
    dispatch(
      getPlannedByFiltersThunk({
        ...filterOptions,
        page: plannedPagination?.page,
      })
    );
  }, [editId, filterOptions, plannedPagination, dispatch]);

  useEffect(() => {
    if (isOpen && editId !== paymentData?.[0]?.planned) {
      dispatch(getAllPaymentPlannedThunk(editId));
    }
  }, [isOpen, editId, paymentData, dispatch]);

  return (
    <>
      <Modal
        show={isOpen}
        onHide={onClose}
        className="modal-650px responsive"
        title={title}
        centered={true}
      >
        <Modal.Header
          closeButton
          className="border-bottom common-border-color py-3"
        >
          <Modal.Title className="text-capitalize fs-21 responsive d-flex align-items-center justify-content-between w-100">
            <span className="max-w-200px d-block truncate-line-1 text-break">
              {title}
            </span>
            <span
              className="text-color-primary fs-16 me-3 cursor-pointer"
              onClick={() => {
                handleEdit();
                onClose();
              }}
            >
              Edit
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body ref={modalBodyRef} className="">
          <div className="d-flex flex-column gap-4">
            <div className="d-flex gap-3 border common-border-color p-12px br-10">
              <img src={icon} className="w-40px h-40px br-8" alt="" />
              <span className="d-flex flex-wrap align-items-center justify-content-between w-100 gap-3">
                <div>
                  <h6 className="p-0 m-0 fs-16 text-capitalize max-w-300px  truncate-line-1 text-break pe-4">
                    {title}
                  </h6>
                  <span className="fs-13 text-color-light-gray text-capitalize max-w-300px text-truncate d-block mt-1">
                    {categoryTitle}
                  </span>
                </div>
                <span
                  className={`${
                    type == transactionTypeEnum.INCOME
                      ? "text-color-light-green"
                      : type == transactionTypeEnum.EXPENSE
                      ? "text-color-invalid"
                      : ""
                  } fs-16 fw-semibold text-nowrap ms-auto`}
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
              </span>
            </div>
            <div>
              <h6 className="fs-19">Details</h6>
              <ul className="m-0 px-20px client-section-bg-color br-10">
                {data?.map((item, index) => {
                  const title = item?.title;
                  const value = item?.value;
                  return (
                    <li
                      key={index}
                      className={`d-flex py-12px align-items-center justify-content-between border-bottom border-dark-white-color`}
                    >
                      <span className="fs-18 fw- text-capitalize text-color-gray me-3 text-nowrap">
                        {title}:
                      </span>
                      <span className="fs-16 text-color-light-gray max-w-300px text-truncate">
                        {value}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h6 className="fs-19">Payment Overview</h6>
              {!loading && paymentData?.length > 0 && (
                <ul className="p-0 m-0 d-flex  flex-column  gap-2">
                  {paymentData?.map((item, index) => {
                    const paymentDate = item?.paymentDate;
                    const timeDifference = getDaysLeft(paymentDate);
                    const status = item?.status;
                    const isAccess =
                      status !== paymentStatusEnum.CANCELLED &&
                      status !== paymentStatusEnum.CONFIRMED;

                    return (
                      <li
                        key={index}
                        className={` ${
                          isAccess ? "" : "opacity-06"
                        } d-flex flex-wrap align-items-center cursor-pointer justify-content-between border common-border-color px-20px py-12px br-10`}
                        onClick={() => isAccess && handleEditSubDataModal(item)}
                      >
                        <span className="d-flex flex-column">
                          <span className="fs-16 fw-semibold text-color-gray text-nowrap me-3">
                            {formatDate(paymentDate, "DD MMMM YYYY")}
                          </span>
                          {isAccess ? (
                            <span className="text-color-primary fs-14">
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
                            <span className="text-lowercase text-color-primary fs-14">
                              {status}
                            </span>
                          )}
                        </span>
                        <span
                          className={`main-text-color d-flex align-items-center gap-2 ms-auto`}
                        >
                          {currencySymbol +
                            " " +
                            formateAmount({ price: amount })}
                          <i className="ri-arrow-right-s-line fs-28  fw-light text-color-gray"></i>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              {page < totalPages && (
                <Button
                  disabled={loading}
                  onClick={handlePagination}
                  className="w-100 mt-2 primary-white-btn border common-border-color br-8 fs-14"
                >
                  <span className="text-color-gray">
                    {loading ? "Loading..." : "Load More"}
                  </span>
                </Button>
              )}
              {loading ? (
                <div className="d-flex align-items-center gap-3 border border-dark-white-color py-2 px-3 br-10">
                  <div className={`w-100 d-flex flex-column`}>
                    <Placeholder animation="glow">
                      <Placeholder
                        className={`bg-color-gray br-10 h-100 w-180px`}
                        xs={2}
                      />
                    </Placeholder>
                    <Placeholder animation="glow">
                      <Placeholder
                        className={`bg-color-gray br-10 h-100 w-100px`}
                        xs={2}
                      />
                    </Placeholder>
                  </div>
                  <Placeholder animation="glow">
                    <Placeholder
                      className={`bg-color-gray br-10 h-100 w-100px`}
                      xs={2}
                    />
                  </Placeholder>
                </div>
              ) : (
                !paymentData?.length && (
                  <span className="client-section-bg-color w-100 d-block mt-3 p-3 br-10 text-center">
                    No Payment data yet
                  </span>
                )
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* ================================================ */}
      {/*                      modals                      */}
      {/* ================================================ */}

      <EditGeneralDetailsModal
        isOpen={currentSubModal == "editDetails"}
        onClose={handleCloseSubModal}
        editData={subEditData}
        open={handleOpenSubModalFunc}
        handleCloseDirectly={handleCloseDirectly}
        onSuccess={handlePaymentConfirm}
        transactionType={type}
        title={title}
        onPostpone={getAllPayment}
      />
    </>
  );
};

EditPlannedModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  editData: PropTypes.object,
  open: PropTypes.func,
  handleOpenSubModal: PropTypes.func,
  handleClickOnEdit: PropTypes.func,
  onSuccess: PropTypes.func,
};

export default memo(EditPlannedModal);
