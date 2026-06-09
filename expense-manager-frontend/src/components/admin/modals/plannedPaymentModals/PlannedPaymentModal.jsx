import { memo, useCallback, useEffect, useMemo, useState } from "react";
import ModelWrapper from "../../../ModelWrapper";
import { Button, Col, Form, Modal } from "react-bootstrap";
import {
  confirmationTypeEnum,
  everyTypeEnum,
  paymentTypeEnum,
  scheduleTypeEnum,
  transactionTypeEnum,
} from "../../../../helpers/enum";
import * as yup from "yup";
import { useFormik } from "formik";
import InputField from "../../../inputFields/InputField";
import PropTypes from "prop-types";
import SelectAccountModal from "./SelectAccountModal";
import SelectCategoryModal from "../SelectCategoryModal";
import SelectConfirmationModal from "./SelectConfirmationModal";
import SchedulePaymentsDateModal from "./SchedulePaymentsDateModal";
import {
  formatDate,
  handleNumericInput,
} from "../../../../helpers/commonFunctions";
import PaymentTypeModal from "./PaymentTypeModal";
import { useSelector } from "react-redux";
import { getAccountThunk, getLabelThunk } from "../../../../store/actions";
import { useDispatch } from "react-redux";
import SelectLabelModal from "./SelectLabelModal";
import {
  createPlannedThunk,
  deletePlannedThunk,
  getPlannedThunk,
  updatePlannedThunk,
} from "../../../../store/planned/thunk";
import useConfirmationAlert from "../../sweetAlerts/ConfirmationAlert";
import CommonDeleteModal from "../deleteModals/CommonDeleteModal";
import { useModalScroll } from "../../../../helpers/customHooks";

const PlannedPaymentModal = ({
  isOpen,
  onClose,
  open,
  editData = {},
  onSuccess,
}) => {
  const { data: labelData } = useSelector((store) => store.Label);
  const { data: accountData } = useSelector((store) => store.Account);
  const { actionLoading, loading } = useSelector((store) => store.Planned);
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const dispatch = useDispatch();
  const isEdit = useMemo(
    () => (Object?.keys(editData)?.length > 0 ? true : false),
    [editData]
  );

  const [currentModal, setCurrentModal] = useState("");
  const [accountTitle, setAccountTitle] = useState("");
  const [categoryTitle, setCategoryTitle] = useState("");
  const [labels, setLabels] = useState([]);
  const [isMore, setIsMore] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  const transactionType = [
    {
      label: "Expense",
      value: transactionTypeEnum.EXPENSE,
    },
    {
      label: "Income",
      value: transactionTypeEnum.INCOME,
    },
  ];

  const initialValues = useMemo(
    () => ({
      type: editData?.type || transactionTypeEnum.EXPENSE || "",
      title: editData?.title || "",
      account: editData?.account?._id || "",
      category: editData?.category?._id || "",
      paymentType: editData?.paymentType || paymentTypeEnum.CASH || "",
      confirmationType:
        editData?.confirmationType || confirmationTypeEnum.MANUAL || "",
      scheduleType: editData?.scheduleType || scheduleTypeEnum.ONE_TIME || "",
      scheduleDate: editData?.scheduleDate || new Date() || "",
      amount: editData?.amount || "",
      labels: editData?.labels?.map((item) => item?._id) || [],
      note: editData?.note || "",
      everyType: editData?.everyType || "",
      every: editData?.every || "",
      weekday: editData?.weekday || "",
    }),
    [editData]
  );

  const validationSchema = yup.object({
    title: yup.string().required("title is required"),
    // amount: yup
    //   .number()
    //   .min(0, "enter valid number")
    //   .required("amount is required"),
    account: yup.string().required("Account is required"),
    category: yup.string().required("category is requried"),
    paymentType: yup.string().required("payment type is requried"),
    confirmationType: yup.string().required("confirmation type is requried"),
    scheduleType: yup.string().required("schedule type is required"),
    scheduleDate: yup.string().required("schedule date is required"),
    labels: yup.array(),
    note: yup.string(),
  });

  const validation = useFormik({
    name: "plannedPaymentValidation",
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      const newValue = { ...values };
      values?.amount > 0 ? "" : (newValue.amount = 0);
      !values?.weekday ? delete newValue?.weekday : "";

      if (values.scheduleType == scheduleTypeEnum.ONE_TIME) {
        delete newValue.everyType;
        delete newValue.every;
      }

      if (isEdit) {
        const response = await dispatch(
          updatePlannedThunk({ id: editData?._id, values: newValue })
        );
        if (updatePlannedThunk.fulfilled.match(response)) {
          await dispatch(getPlannedThunk());
          onSuccess();
          resetForm();
          setAccountTitle("");
          setLabels([]);
          setCategoryTitle("");
          onClose();
        }
      } else {
        !values.labels?.length > 0 ? delete newValue?.labels : "";
        !values.note ? delete newValue?.note : "";
        values?.maxRepetitions == null ? delete newValue?.maxRepetitions : "";
        values?.stopDate == null ? delete newValue?.stopDate : "";

        const response = await dispatch(createPlannedThunk(newValue));
        if (createPlannedThunk.fulfilled.match(response)) {
          await dispatch(getPlannedThunk());
          resetForm();
          setAccountTitle("");
          setLabels([]);
          setCategoryTitle("");
          onClose();
        }
      }
    },
  });

  const closeModal = useCallback(() => {
    validation.resetForm();
    setAccountTitle("");
    setLabels([]);
    setCategoryTitle("");
    onClose();
  }, [onClose, validation]);

  const handleOpenSubModal = (value) => {
    setCurrentModal(value);
    onClose();
  };

  const handleCloseSubModal = useCallback(() => {
    setCurrentModal("");
    open();
  }, []);

  const handleCloseCategoryModal = useCallback(() => {
    open();
    setCurrentModal("");
  }, [open]);

  const handleCloseSubModalDirectly = useCallback(() => {
    setCurrentModal("");
  }, []);

  const ordinalSuffix = (num) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  const addAccountFieldValue = useCallback((value) => {
    validation.setFieldValue("account", value?._id || "");
    setAccountTitle(value?.title);
  }, []);

  const onSelectCategory = useCallback((value) => {
    validation.setFieldValue("category", value?._id);
    setCategoryTitle(value?.title);
  }, []);

  const confirmationFieldValue = useCallback((value) => {
    validation.setFieldValue("confirmationType", value);
  }, []);

  const schedulePaymentValue = useCallback(
    (value) => {
      validation.setValues({ ...validation.values, ...value });
    },
    [validation]
  );

  const paymentTypeValue = useCallback((value) => {
    validation.setFieldValue("paymentType", value);
  }, []);

  const labelValue = useCallback((value) => {
    setLabels(value);
    const labelids = value?.map((item) => item?._id);
    validation.setFieldValue("labels", labelids);
  }, []);

  const formateTitle = useCallback((value) => {
    const splitted = value?.split("_");
    return splitted?.join(" ");
  }, []);

  const handleRemoveLabel = useCallback(
    (e, item) => {
      e.stopPropagation();
      const newLabels = labels.filter((label) => label._id !== item);
      setLabels(newLabels);

      validation.setFieldValue(
        "labels",
        newLabels?.map((item) => item?._id)
      );
    },
    [labels]
  );

  const triggerDeleteRecord = useConfirmationAlert({
    icon: "warning",
    title: "Confirm Record Delete",
    text: "Are you sure you want to delete this record? This change cannot be undone.",
    confirmButtonText: "Delete Record",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "Record has been successfully deleted.",
  });

  const handleDeleteRecord = useCallback(() => {
    // triggerDeleteRecord({
    //   dispatchFunction: async () => {
    //     const response = await dispatch(deletePlannedThunk(editData?._id));
    //     if (deletePlannedThunk.fulfilled.match(response)) {
    //       await dispatch(getPlannedThunk());
    //       onClose();
    //       validation.resetForm();
    //       return true;
    //     }
    //   },
    // });
    setIsDelete(true);
  }, []);
  console.log(validation.values, " >>>>>>>>");
  const scheduleDateFormate = () => {
    if (validation.values.scheduleType == scheduleTypeEnum.ONE_TIME) {
      return (
        formatDate(validation.values.scheduleDate, "DD MMMM YYYY") || "None"
      );
    } else {
      if (validation.values?.everyType == everyTypeEnum.WEEK_DAY) {
        return (
          <span>
            {`Every ${
              validation?.values?.every > 1
                ? ordinalSuffix(validation.values?.every)
                : ""
            }`}{" "}
            {validation.values?.weekday}
          </span>
        );
      } else if (
        validation.values?.everyType == everyTypeEnum.MONTH ||
        validation.values?.everyType == everyTypeEnum.YEAR
      ) {
        return (
          <span className="text-lowercase">
            {validation.values?.everyType}ly
          </span>
        );
      } else {
        return (
          <span className="text-lowercase">
            {`Every ${
              validation?.values?.every > 1
                ? ordinalSuffix(validation.values?.every)
                : ""
            }`}{" "}
            {validation.values.everyType}
          </span>
        );
      }
    }
  };

  const handleCloseDeleteModal = useCallback(() => setIsDelete(false), []);

  const closeCategoryModalDirect = useCallback(() => {
    setCurrentModal("");
  }, []);

  const openCategoryModalDirect = useCallback(() => {
    setCurrentModal("selectCategory");
  }, []);

  const handleConfirm = useCallback(async () => {
    const response = await dispatch(deletePlannedThunk(editData?._id));
    if (deletePlannedThunk.fulfilled.match(response)) {
      await dispatch(getPlannedThunk());
      onClose();
      validation.resetForm();
      return true;
    }
    return false;
  }, [dispatch, editData, onClose, validation]);

  useEffect(() => {
    if (isOpen && !labelData?.length > 0) {
      dispatch(getLabelThunk());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (isOpen && !accountData?.length) {
      dispatch(getAccountThunk());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    // if (isEdit) {
    setAccountTitle(isEdit ? editData?.account?.title : "");
    setCategoryTitle(isEdit ? editData?.category?.title : "");
    setLabels(isEdit ? editData?.labels : []);
    // }
  }, [editData]);

  return (
    <>
      <ModelWrapper
        show={isOpen}
        onHide={closeModal}
        className="modal-650px responsive"
        title={`${isEdit ? "Edit" : "Add"}  Planned payment`}
      >
        <Form onSubmit={validation.handleSubmit}>
          <Modal.Body ref={modalBodyRef} className="pt-0">
            <div
              className={`${
                validation.values.type == transactionTypeEnum.EXPENSE
                  ? "bg-color-expense-type-color-"
                  : "bg-color-income-type-color-"
              } position-sticky top-0 z-3`}
            >
              <Form.Group className="pt-3 pb-2 bg-white">
                <Form.Control
                  className={` text-center placeholder-white bg-transparent fs-45 fw-semibold border-0 ${
                    validation.values.type == transactionTypeEnum.EXPENSE
                      ? "text-color-expense placeholder-expense"
                      : "text-color-income placeholder-income"
                  }`}
                  type="number"
                  title="amount"
                  name="amount"
                  id="amount"
                  placeholder="0"
                  onInput={handleNumericInput}
                  min={0}
                  autoComplete="off"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.amount}
                />
                {/* <div className="w-100 overflow-hidden">
                  <input
                    name="amount"
                    id="amount"
                    title="amount"
                    value={validation.values.amount}
                    type="number"
                    autoComplete="off"
                    onChange={validation.handleChange}
                    style={{
                      minWidth: `${
                        Math.max(
                          validation.values.amount.toString().length,
                          1
                        ) * 30
                      }px`,
                      maxWidth: `${
                        Math.max(
                          validation.values.amount.toString().length,
                          1
                        ) * 20
                      }px`,
                    }}
                    className="mx-auto d-block fs-45 text-center max-w-100 overflow-scroll"
                  />
                </div> */}
              </Form.Group>
              <div className="d-flex client-section-bg-color p-2  br-5 gap-1">
                {transactionType?.map((item, index) => {
                  const isMatch = item?.value == validation.values.type;
                  const label = item?.label;
                  const type = item?.value;
                  return (
                    <Col key={index} xs={6} className="">
                      <Button
                        className={`text-center fs-18 w-100 rounded-0 fw-medium  ${
                          isMatch
                            ? "bg-white br-5 common-border-color border text-color-gray primary-white-btn v-fit"
                            : "text-color-dusty-gray bg-transparent border border-color-transparent"
                        }`}
                        onClick={() => validation.setFieldValue("type", type)}
                      >
                        {label}
                      </Button>
                    </Col>
                  );
                })}
              </div>
            </div>
            <div className=" pt-3">
              <InputField
                type="text"
                name="title"
                id="title"
                label="Payment Name"
                placeholder="Enter Name"
                className="mb-3"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.title}
                invalid={validation.touched.title && validation.errors.title}
                errorMessage={validation.errors.title}
              />

              <InputField
                type="clickOnly"
                name="account"
                id="account"
                label="account"
                placeholder="Enter Name"
                value={accountTitle || "Select"}
                postIcon={<i className="ri-arrow-right-s-line fs-21"></i>}
                onClick={() => handleOpenSubModal("selectAccount")}
                invalid={
                  validation.touched.account && validation.errors.account
                }
                errorMessage={validation.errors.account}
              />
              <InputField
                type="clickOnly"
                name="category"
                id="category"
                label="category"
                placeholder="Enter Name"
                value={categoryTitle || "None"}
                postIcon={<i className="ri-arrow-right-s-line fs-21"></i>}
                onClick={() => handleOpenSubModal("selectCategory")}
                invalid={
                  validation.touched.category && validation.errors.category
                }
                errorMessage={validation.errors.category}
              />

              <InputField
                type="clickOnly"
                name="scheduleDate"
                id="scheduleDate"
                label="Date and repeat"
                placeholder="Enter Name"
                value={
                  validation.values?.every ? (
                    <span> {scheduleDateFormate()}</span>
                  ) : (
                    formatDate(
                      validation.values.scheduleDate,
                      "DD MMMM YYYY"
                    ) || "None"
                  )
                }
                postIcon={<i className="ri-arrow-right-s-line fs-21"></i>}
                onClick={() => handleOpenSubModal("selectSchedulePaymentDate")}
                invalid={
                  validation.touched.scheduleDate &&
                  validation.errors.scheduleDate
                }
                errorMessage={validation.errors.scheduleDate}
              />

              {/* <InputField
                type="clickOnly"
                name="label"
                id="label"
                label="label"
                placeholder="Select label"
                value={
                  (validation.values.label?.length &&
                    validation.values.label?.length) ||
                  "Select Label"
                }
                postIcon={<i className="ri-arrow-right-s-line fs-21"></i>}
                onClick={() => handleOpenSubModal("selectLabel")}
                invalid={validation.touched.label && validation.errors.label}
                errorMessage={validation.errors.label}
              /> */}

              {/* ==================================================== */}
              {/*                     More Details                     */}
              {/* ==================================================== */}

              <span
                onClick={() => setIsMore(!isMore)}
                className="user-select-none d-block mb-3 text-end text-color-primary fs-16 cursor-pointer"
              >
                <i
                  className={`${
                    isMore ? "ri-subtract-line" : "ri-add-line"
                  } text-color-primary fs-18`}
                ></i>{" "}
                More Details
              </span>

              {isMore && (
                <div>
                  <InputField
                    type="clickOnly"
                    name="confirmationType"
                    id="confirmationType"
                    label="confirmation"
                    placeholder="Enter Name"
                    value={validation.values.confirmationType}
                    postIcon={<i className="ri-arrow-right-s-line fs-21"></i>}
                    onClick={() => handleOpenSubModal("selectConfirmation")}
                    invalid={
                      validation.touched.confirmationType &&
                      validation.errors.confirmationType
                    }
                    errorMessage={validation.errors.confirmationType}
                  />

                  <InputField
                    className="mb-3"
                    label="note"
                    placeholder="enter note"
                    id="note"
                    name="note"
                    type="text"
                    value={validation.values.note}
                    onChange={validation.handleChange}
                    invalid={validation.touched.note && validation.errors.note}
                    errorMessage={validation.errors.note}
                    optional
                  />
                  <InputField
                    type="clickOnly"
                    name="pamentType"
                    id="pamentType"
                    label="payment type"
                    placeholder="Payment Type"
                    value={validation.values.paymentType || "None"}
                    title={formateTitle(validation.values.paymentType)}
                    postIcon={<i className="ri-arrow-right-s-line fs-21"></i>}
                    onClick={() => handleOpenSubModal("selectPaymentType")}
                    invalid={
                      validation.touched.paymentType &&
                      validation.errors.paymentType
                    }
                    errorMessage={validation.errors.paymentType}
                  />
                  <div className="mb-3 text-break">
                    <span className="text-capitalize fs-16 d-block mb-2">
                      label
                      <span className="fs-12 ms-2 text-color-monsoon">
                        (optional)
                      </span>
                    </span>
                    <span
                      onClick={() => handleOpenSubModal("selectLabel")}
                      className={`border common-border-color
                  br-10 d-block w-100 d-flex align-items-center mb-4 form-control cursor-pointer`}
                    >
                      <ul className="m-0 p-0 d-flex  gap-2  ">
                        {labels?.length
                          ? labels?.map((item, index) => {
                              const title = item?.title;
                              const id = item?._id;
                              return (
                                <li
                                  key={index}
                                  className="bg-color-primary text-white px-2 br-5 py-1"
                                >
                                  {title}
                                  <i
                                    onClick={(e) => handleRemoveLabel(e, id)}
                                    className="ri-close-line fw-bold ms-2"
                                  ></i>
                                </li>
                              );
                            })
                          : "Select Label"}
                      </ul>
                      <span className="ms-auto ps-3">
                        <i className="ri-arrow-right-s-line fs-21"></i>
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
            <Button
              disabled={actionLoading || loading}
              className="w-100 primary-btn m-0 fs-16"
              type="submit"
            >
              {actionLoading || loading ? "Loading..." : "Submit"}
            </Button>
            {isEdit && (
              <span className="d-block text-center w-100 fs-13 text-color-light-gray mt-3">
                <span className="cursor-pointer" onClick={handleDeleteRecord}>
                  <i className="ri-delete-bin-line"></i> Delete Record
                </span>
              </span>
            )}
          </Modal.Body>
        </Form>
      </ModelWrapper>

      {/* =============================================== */}
      {/*                 Select Modals                   */}
      {/* =============================================== */}

      <SelectAccountModal
        isOpen={currentModal == "selectAccount"}
        onClose={handleCloseSubModal}
        onSelectValue={addAccountFieldValue}
      />

      <SelectCategoryModal
        isOpen={currentModal == "selectCategory"}
        onHide={handleCloseCategoryModal}
        // onHide={handleCloseSubModal}
        open={openCategoryModalDirect}
        close={closeCategoryModalDirect}
        onSelectCategory={onSelectCategory}
        animation
        backdropClassName=""
        filterKey={
          validation.values.type !== transactionTypeEnum.TRANSFER
            ? validation.values.type
            : ""
        }
      />

      <SelectConfirmationModal
        isOpen={currentModal == "selectConfirmation"}
        onClose={handleCloseSubModal}
        onSelectValue={confirmationFieldValue}
        value={validation.values.confirmationType}
      />

      <SchedulePaymentsDateModal
        isOpen={currentModal == "selectSchedulePaymentDate"}
        onClose={handleCloseSubModal}
        onSelectValue={schedulePaymentValue}
        currentTab={validation.values.scheduleType}
        editData={editData}
        closeDirectly={handleCloseSubModalDirectly}
        open={() => handleOpenSubModal("selectSchedulePaymentDate")}
      />

      <PaymentTypeModal
        isOpen={currentModal == "selectPaymentType"}
        onClose={handleCloseSubModal}
        onSelectValue={paymentTypeValue}
        value={validation.values.paymentType}
      />

      <SelectLabelModal
        isOpen={currentModal == "selectLabel"}
        onClose={handleCloseSubModal}
        onSelectValue={labelValue}
        value={labels}
      />

      <CommonDeleteModal
        isOpen={isDelete}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Delete Planned Payment",
          description: "Are you sure you want to delete the Planned Payment?",
        }}
        onConfirm={handleConfirm}
        loading={actionLoading || loading}
      />
    </>
  );
};

PlannedPaymentModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  open: PropTypes.func,
  editData: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default memo(PlannedPaymentModal);
