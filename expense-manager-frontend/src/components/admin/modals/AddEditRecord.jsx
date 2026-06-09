import {
  Button,
  ButtonToolbar,
  Col,
  Form,
  Modal,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import ModelWrapper from "../../ModelWrapper";
import PropTypes from "prop-types";
import SelectField from "../../inputFields/SelectField";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrencyThunk } from "../../../store/currency/thunk";
import { getAccountTypeThunk } from "../../../store/accountType/thunk";
import InputField from "../../inputFields/InputField";
import { createLabelThunk, getLabelThunk } from "../../../store/label/thunk";
import { useFormik } from "formik";
import SelectCategoryModal from "./SelectCategoryModal";
import {
  formatDate,
  isPremium,
  isTransactionAction,
} from "../../../helpers/commonFunctions";
import TextAreaField from "../../inputFields/TextAreaField";
import * as yup from "yup";
import {
  awsThunk,
  createTransactionThunk,
  deleteMultipleTransactionThunk,
  getAccountThunk,
  getAllPayeeThunk,
  updateTransactionThunk,
} from "../../../store/actions";
import { toastError } from "../../../config/toastConfig";
import {
  setAmountToAccount,
  updateAmountToAccount,
} from "../../../store/account/slice";
import useConfirmationAlert from "../sweetAlerts/ConfirmationAlert";
import {
  eventEnum,
  groupAccessEnum,
  subscriptionTypeEnum,
  transactionTypeEnum,
} from "../../../helpers/enum";
import PremiumModal from "./PremiumModal";
import { Link } from "react-router-dom";
import { ADMIN } from "../../../constants/routes";
import DeleteRecordModal from "./deleteModals/DeleteRecordModal";
import {
  setStateEditData,
  setStateIsDuplicate,
  setStateTemplateData,
} from "../../../store/transaction/slice";
import { handleFirebaseEvent } from "../../../firebase/config";
import { useModalScroll } from "../../../helpers/customHooks";

const AddEditRecord = ({
  isOpen,
  onHide,
  // item = {},
  onSuccess,
  onDeleteSuccess,
  // isDuplicate = false,
  open,
}) => {
  const [isMoreOption, setIsMoreOption] = useState(false);

  const {
    loading,
    editData: item,
    isDuplicate,
    templateData,
  } = useSelector((store) => store.Transaction);
  const isTemplateData = useMemo(
    () => (Object.keys(templateData)?.length > 0 ? true : false),
    [templateData]
  );
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.Auth);
  const { data, flatData } = useSelector((store) => store.Currency);
  const {
    data: payeeData,
    loading: payeeLoading,
    hasFetchedPayee,
  } = useSelector((store) => store.Payee);
  const { uploadLoading: awsLoading } = useSelector((store) => store.Aws);
  const { data: accountData } = useSelector((store) => store.Account);
  const { chartData } = useSelector((store) => store.Dashboard);

  const isEdit = Object.keys(item)?.length > 0;

  // const userCurrency = user?.currencies?.[0]?.currency || "";
  const [modalShow, setModalShow] = useState(false);
  const [isCategoryModal, setIsCategoryModal] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  // const [isPayeeModal, setIsPayeeModal] = useState(false);
  const {
    data: labelData,
    actionLoading: labelLoading,
    accessLimit,
    hasFetchedLabels,
  } = useSelector((store) => store.Label);

  const { data: groupData, singleUserGroupData } = useSelector(
    (store) => store.Group
  );
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  isOpen && handleFirebaseEvent(eventEnum.TRANSACTION_INIT);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [addLabel, setAddLabel] = useState(false);
  const [premiumModal, setPremiumModal] = useState(false);
  const [isPreviw, setIsPreview] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const handleFindCurrency = (value) => {
    return accountData?.filter((ele) => ele?._id == value)?.[0]?.currency?._id;
  };

  const resetState = useCallback(() => {
    dispatch(setStateIsDuplicate(false));
    dispatch(setStateEditData({}));
    dispatch(setStateTemplateData({}));
  }, [dispatch]);

  const localFromAcc =
    !isTemplateData &&
    !isEdit &&
    !chartData?.accounts?.length &&
    accountData?.some((value) => value?._id == localStorage.getItem("fromAcc"))
      ? localStorage.getItem("fromAcc")
      : false;

  const initialValues = {
    labels:
      templateData?.labels?.reduce((acc, item) => [...acc, item._id], []) ||
      item?.labels?.reduce((acc, item) => [...acc, item._id], []) ||
      [],
    account:
      localFromAcc ||
      templateData?.account?._id ||
      chartData?.accounts?.[0] ||
      item?.account?._id ||
      accountData?.[0]?._id ||
      "",
    amount: templateData?.amount || item?.amount || "",
    currency:
      handleFindCurrency(
        localFromAcc ||
          templateData?.account?._id ||
          chartData?.accounts?.[0] ||
          item?.account?._id ||
          accountData?.[0]?._id
      ) ||
      item?.account?.currency?._id ||
      accountData?.[0]?.currency?._id ||
      "",
    category: templateData?.category?._id || item?.category?._id || "",
    date: formatDate(item?.date || new Date(), "yyyy-MM-DD") || "",
    time: "",
    type: templateData?.type || item?.type || transactionTypeEnum.EXPENSE,
    to: item?.to?._id || accountData?.[1]?._id || accountData?.[0]?._id || "",
    //  other details values
    payee: templateData?.payWith?._id || item?.payee?._id || null,
    note: templateData?.note || item?.note || "",
    paymentType: templateData?.paymentType || item?.paymentType || "CASH",
    status: item?.status || "CLEARED",
    warranty: item?.warranty || "",
    // location: "",
    photo: item?.photo || "",
  };

  const validationSchema = yup.object({
    account: yup.string().required("account is required"),
    amount: yup
      .number()
      .typeError("enter valid amount")
      .min(1, "enter valid amount")
      .test(
        "len",
        "amount must be at most 16 digits",
        (val) => val && val.toString()?.length <= 16
      )
      .required("enter valid amount"),
    currency: yup.string().required("currency is required"),
    category: yup.string().required("category is required"),
    date: yup.string().required("date is required"),
    status: yup.string().required("status is required"),
  });

  const validation = useFormik({
    name: "record-validation",
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      values.amount = Number(values.amount);
      const allValues = values;

      // date & time handling
      const dateTimeString = `${allValues.date}T${allValues.time}:00`;
      const dateObject = new Date(dateTimeString);
      // allValues.date = dateObject.toISOString();
      delete allValues.time;

      // expense
      if (values.type !== transactionTypeEnum.TRANSFER) delete values.to;

      if (!isDuplicate && isEdit) {
        const response = await dispatch(
          updateTransactionThunk({
            id: item._id,
            values: {
              ...allValues,
              date: dateObject.toISOString(),
              ...(!allValues?.payee
                ? { payee: null }
                : { payee: allValues?.payee }),
            },
          })
        );
        if (updateTransactionThunk.fulfilled.match(response)) {
          dispatch(
            updateAmountToAccount({
              type: allValues.type,
              amount: allValues.amount,
              preAmount: item?.amount,
              id: allValues.account,
              to: allValues?.to || "",
              preTo: item?.to?._id,
              preId: item?.account?._id,
            })
          );
          setSelectedCategory("");
          onSuccess && onSuccess();
          resetState();
          onHide();
          resetForm();
        }
      } else {
        let filteredValue = {
          ...allValues,
          date: dateObject.toISOString(),
        };
        (!values.payee || values.payee == null) && delete filteredValue.payee;
        const response = await dispatch(createTransactionThunk(filteredValue));
        if (createTransactionThunk.fulfilled.match(response)) {
          dispatch(
            setAmountToAccount({
              type: allValues.type,
              amount: allValues.amount,
              id: allValues.account,
              to: allValues?.to || "",
            })
          );
          handleFirebaseEvent(eventEnum.TRANSACTION_CREATED);
          handleFirebaseEvent();
          setSelectedCategory("");
          onSuccess && onSuccess();
          resetState();
          onHide();
          resetForm();
        }
      }

      localStorage.setItem("fromAcc", values.account);
    },
  });

  const labelInitialValue = {
    title: "",
    color: "#b772ff",
  };

  const labelValidateSchema = yup.object({
    title: yup.string().required("title is required"),
    color: yup.string().required("color is required"),
  });

  const labelValidation = useFormik({
    name: "labelValidation",
    initialValues: labelInitialValue,
    validationSchema: labelValidateSchema,
    onSubmit: async (values, { resetForm }) => {
      const response = await dispatch(createLabelThunk(values));
      if (createLabelThunk.fulfilled.match(response)) {
        validation.setFieldValue("labels", [response.payload.data._id]);
        setAddLabel(false);
        resetForm();
      }
    },
  });

  const handlePhotoAttachment = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dirName", "transaction_attachment");
    const response = await dispatch(awsThunk(formData));
    if (awsThunk.fulfilled.match(response)) {
      validation.setFieldValue("photo", response.payload.data);
    }
  };

  const handleOpenCategoryModal = useCallback(() => {
    setIsCategoryModal(true);
    onHide();
  }, [onHide]);

  const handleCloseCategoryModal = useCallback(() => {
    setIsCategoryModal(false);
    open();
    // onHide();
    // customFunction();
  }, [open]);

  const handleHideDirect = useCallback(() => {
    setIsCategoryModal(false);
  }, []);

  const handleIsPreview = () => {
    setIsPreview(!isPreviw);
  };

  const onSelectCategory = useCallback(
    (e) => {
      validation.setFieldValue("category", e._id);
      setSelectedCategory(e.title);
    },
    [validation]
  );

  const onMultipleLabelSelect = useCallback((value) => {
    validation.setFieldValue(
      "labels",
      value?.reduce((acc, item) => [...acc, item.value], [])
    );
    setSelectedOption(value);
  }, []);

  const handleTransactionTab = (value) => {
    validation.setFieldValue("type", value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (
      validation.values.type == transactionTypeEnum.TRANSFER &&
      (validation.values.account == validation.values.to ||
        !validation.values.to)
    ) {
      return toastError("Account and To account cannot be the same");
    }
    validation.handleSubmit();
  };

  const handleCloseModal = () => {
    handleFirebaseEvent(eventEnum.TRANSACTION_CANCELLED);
    resetState();
    setSelectedCategory("");
    validation.resetForm();
    setModalShow(false);
    setIsMoreOption(false);
    setIsPreview(false);
    onHide();
  };

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

  const handleDeleteRecord = async () => {
    if (item?._id) {
      // triggerDeleteRecord({
      //   dispatchFunction: async () => {
      //     const response = await dispatch(
      //       deleteMultipleTransactionThunk({ ids: [item?._id] })
      //     );
      //     if (deleteMultipleTransactionThunk.fulfilled.match(response)) {
      //       onDeleteSuccess && onDeleteSuccess();
      //       onHide();
      //       setSelectedCategory("");
      //       validation.resetForm();
      //       return true;
      //     }
      //   },
      // });
      setIsDelete(true);
    } else {
      toastError("Select at least one record for delete");
    }
  };

  const handleCloseDeleteModal = useCallback(() => {
    setIsDelete(false);
    // dispatch(setStateEditData({}));
  }, []);

  const labelsFilterData = useMemo(
    () =>
      labelData?.map((item) =>
        validation.values.labels?.includes(item?._id)
          ? { value: item._id, label: item?.title }
          : false
      ),
    [labelData, validation.values.labels]
  );

  const handleOpen = useCallback(() => {
    setIsCategoryModal(true);
  }, [open]);

  const handleConfirm = useCallback(async () => {
    if (item?._id) {
      const response = await dispatch(
        deleteMultipleTransactionThunk({ ids: [item?._id] })
      );
      if (deleteMultipleTransactionThunk.fulfilled.match(response)) {
        onDeleteSuccess && onDeleteSuccess();
        resetState();
        dispatch(setStateEditData({}));
        onHide();
        setSelectedCategory("");
        validation.resetForm();
        return true;
      }
      return false;
    } else {
      toastError("Select at least one record for delete");
    }
  }, [item, onDeleteSuccess, onHide, resetState]);

  useEffect(() => {
    if (item?.category?.title) {
      setSelectedCategory(item?.category?.title || "");
    }
    if (isTemplateData) {
      setSelectedCategory(templateData?.category?.title || "");
    }

    if (isTemplateData) {
      if (templateData?.labels?.length > 0) {
        const modifiedVal = templateData?.labels?.reduce(
          (acc, item) => [...acc, { value: item._id, label: item.title }],
          []
        );
        setSelectedOption(modifiedVal);
      } else {
        setSelectedOption([]);
      }
    } else {
      if (item?.labels?.length > 0) {
        const modifiedVal = item?.labels?.reduce(
          (acc, item) => [...acc, { value: item._id, label: item.title }],
          []
        );
        setSelectedOption(modifiedVal);
      } else {
        setSelectedOption([]);
      }
    }

    const date = new Date(item?.date || Date.now());
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    if (isOpen && !validation.values.time) {
      validation.setFieldValue("time", `${hours}:${minutes}`);
    }
    if (isOpen && !data?.length > 0) {
      dispatch(getCurrencyThunk());
    }
    if (isOpen && !accountData?.length > 0) {
      dispatch(getAccountTypeThunk());
      dispatch(getAccountThunk());
    }
    if (isOpen && !hasFetchedLabels && !labelData?.length > 0) {
      dispatch(getLabelThunk());
    }
    // set default time
    // validation.setFieldValue("time", `${hours}:${minutes}`);
    // set default date
    // validation.setFieldValue(
    //   "date",
    //   formatDate(item?.date || new Date(), "yyyy-MM-DD")
    // );

    if (isOpen && !accountData?.length) {
      toastError("Create at least one account first");
      resetState();
      onHide();
    }
    ``;
    if (isOpen && !accountData?.length) {
      dispatch(getAccountThunk());
    }

    if (isOpen && !hasFetchedPayee && !payeeData?.length) {
      dispatch(getAllPayeeThunk());
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedOption(validation.values.labels);
  }, [isOpen]);

  return (
    <>
      <Modal
        centered={true}
        show={accountData?.length ? modalShow || isOpen : false}
        onHide={handleCloseModal}
        className="modal-650px responsive customized-modal"
      >
        <Modal.Header
          closeButton
          className="border-bottom common-border-color py-4"
        >
          <Modal.Title className="text-capitalize fs-21 responsive d-flex align-items-center justify-content-between w-100">
            <span className="max-w-300px d-block text-truncate">
              {isDuplicate
                ? "Duplicate record"
                : isEdit
                ? "Edit record"
                : "add record"}
            </span>
            {!isEdit &&
              !isDuplicate &&
              location.pathname !== ADMIN.SETTINGS.TEMPLATES.PATH && (
                <Link
                  onClick={() => dispatch(setStateEditData({}))}
                  to={ADMIN.SETTINGS.TEMPLATES.PATH}
                  className="d-block ms-auto me-3 fs-16 text-color-primary cursor-pointer"
                >
                  Template
                </Link>
              )}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleFormSubmit}>
          <Modal.Body
            ref={modalBodyRef}
            className={`${
              !isDuplicate &&
              isEdit &&
              isTransactionAction({ id: validation.values.account })
                ? "pb-2"
                : "pb-4"
            }`}
          >
            <div className="mb-3 border text-center fs-16 common-border-color w-100 user-select-none fw-medium client-section-bg-color d-flex w-fit br-10 overflow-hidden p-1 p-sm-2">
              <span
                className={`col-4 py-2 px-3  ${
                  validation.values.type == transactionTypeEnum.EXPENSE
                    ? "bg-white br-10 common-border-color border dark-text-color"
                    : "text-color-dusty-gray"
                } d-block cursor-pointer`}
                onClick={() =>
                  handleTransactionTab(transactionTypeEnum.EXPENSE)
                }
              >
                Expense
              </span>
              <span
                className={`col-4 py-2 px-3  ${
                  validation.values.type == transactionTypeEnum.INCOME
                    ? "bg-white br-8 common-border-color border dark-text-color"
                    : "text-color-dusty-gray"
                } d-block  common-border-color cursor-pointer`}
                onClick={() => handleTransactionTab(transactionTypeEnum.INCOME)}
              >
                Income
              </span>
              <span
                className={`col-4 py-2 px-3  ${
                  validation.values.type == transactionTypeEnum.TRANSFER
                    ? "bg-white br-8 common-border-color border dark-text-color"
                    : "text-color-dusty-gray"
                } d-block cursor-pointer`}
                onClick={() =>
                  handleTransactionTab(transactionTypeEnum.TRANSFER)
                }
              >
                Transfer
              </span>
            </div>
            <Row>
              <div
                className={`${
                  validation.values.type == transactionTypeEnum.TRANSFER
                    ? "row w-100 pe-0"
                    : ""
                }`}
              >
                <Col
                  xs={
                    validation.values.type == transactionTypeEnum.TRANSFER
                      ? 6
                      : 12
                  }
                >
                  <SelectField
                    label="account"
                    name="account"
                    id="account"
                    value={
                      validation.values.account || accountData[0]?._id || ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      validation.setFieldValue(
                        "currency",
                        handleFindCurrency(value)
                      ),
                        validation.setFieldValue("account", value);
                    }}
                    onBlur={validation.handleBlur}
                    invalid={
                      validation.touched.account && validation.errors.account
                    }
                    errorMessage={validation.errors.account}
                  >
                    {accountData?.map((item, index) => {
                      const permission =
                        singleUserGroupData?.member?.accounts[index]
                          ?.permission;
                      return (
                        <option
                          key={index}
                          value={item?._id}
                          disabled={permission == groupAccessEnum.READONLY}
                        >
                          {item?.title}
                        </option>
                      );
                    })}
                  </SelectField>
                </Col>
                {validation.values.type == transactionTypeEnum.TRANSFER && (
                  <Col
                    className="pe-0"
                    xs={
                      validation.values.type == transactionTypeEnum.TRANSFER
                        ? 6
                        : 12
                    }
                  >
                    <Col xs={12}>
                      <SelectField
                        label="to account"
                        name="to"
                        id="to"
                        value={
                          validation.values.to || accountData[0]?._id || ""
                        }
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        invalid={validation.touched.to && validation.errors.to}
                        errorMessage={validation.errors.to}
                      >
                        {accountData?.map((item, index) => {
                          return (
                            <option key={index} value={item?._id}>
                              {item?.title}
                            </option>
                          );
                        })}
                      </SelectField>
                    </Col>
                  </Col>
                )}
              </div>
              <Col xs={6} sm={8} clas>
                <InputField
                  name="amount"
                  id="amount"
                  label="amount"
                  // type="number"
                  fieldClass="text-end pe-3 ps-5"
                  preIcon={
                    validation.values.type == transactionTypeEnum.EXPENSE ? (
                      <i className="ri-subtract-line"></i>
                    ) : (
                      <i className="ri-add-line"></i>
                    )
                  }
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.amount}
                  invalid={
                    validation.touched.amount && validation.errors.amount
                  }
                  errorMessage={validation.errors.amount}
                  placeholder="0"
                  inputMode="numeric"
                />
              </Col>
              <Col xs={6} sm={4}>
                <SelectField
                  disabled
                  name="currency"
                  id="currency"
                  label="currency"
                  // onChange={validation.handleChange}
                  // onBlur={validation.handleBlur}
                  value={validation.values.currency}
                  invalid={
                    validation.touched.currency && validation.errors.currency
                  }
                  errorMessage={validation.errors.currency}
                >
                  {flatData?.map((item, index) => {
                    return (
                      <option key={index} value={item?._id}>
                        {item?.code}
                      </option>
                    );
                  })}
                </SelectField>
              </Col>
              <Col xs={12}>
                <InputField
                  readOnly
                  onClick={handleOpenCategoryModal}
                  name="category"
                  id="category"
                  label="category"
                  placeholder="select category"
                  // onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.category ? selectedCategory : ""}
                  fieldClass="cursor-pointer"
                  postIcon={<i className="ri-arrow-down-s-line"></i>}
                  invalid={
                    validation.touched.category && validation.errors.category
                  }
                  errorMessage={validation.errors.category}
                />
              </Col>
              <Col xs={12}>
                <div className="d-flex align-items-end mb-3 gap-2 w-100">
                  <SelectField
                    optional
                    className="w-100 record-label-input-width"
                    multipleSelect
                    name="labels"
                    id="labels"
                    label="labels"
                    onChange={onMultipleLabelSelect}
                    onBlur={validation.handleBlur}
                    value={labelsFilterData}
                    // value={selectedOption}
                    invalid={
                      validation.touched.labels && validation.errors.labels
                    }
                    errorMessage={validation.errors.labels}
                  >
                    <option value="">select label</option>
                    {labelData?.map((item, index) => {
                      return (
                        <option value={item?._id} key={index}>
                          {item?.title}
                        </option>
                      );
                    })}
                  </SelectField>
                  <span
                    onClick={() => {
                      if (isPremium() || labelData.length < accessLimit) {
                        setAddLabel((pre) => !pre);
                      } else {
                        onHide();
                        setModalShow(false);
                        setPremiumModal(true);
                      }
                    }}
                    className={`d-flex align-items-center justify-content-center border-0 v-fit br-10 p-0 min-wh-40px primary-btn mb-1 cursor-pointer`}
                  >
                    {addLabel ? (
                      <i className="fw-bold fs-5 ri-close-line"></i>
                    ) : (
                      <i className="fw-bold fs-5 ri-add-line"></i>
                    )}
                  </span>
                </div>
              </Col>
              {addLabel && (
                <Col xs={12}>
                  <div
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault(); // Prevent default form submission
                        labelValidation.handleSubmit(); // Manually trigger Formik submission
                      }
                    }}
                  >
                    <div className="d-flex gap-2 align-items-end mb-3">
                      <InputField
                        preIcon={
                          <input
                            id="color"
                            name="color"
                            onChange={labelValidation.handleChange}
                            onBlur={labelValidation.handleBlur}
                            value={labelValidation.values.color}
                            type="color"
                            className="ms-2 mt-1 h-30px w-30px rounded-circle"
                          />
                        }
                        label="add label"
                        name="title"
                        id="title"
                        onChange={labelValidation.handleChange}
                        onBlur={labelValidation.handleBlur}
                        value={labelValidation.values.title}
                        invalid={
                          labelValidation.touched.title &&
                          labelValidation.errors.title
                        }
                        errorMessage={labelValidation.errors.title}
                        className="w-100"
                        fieldClass="ps-55px"
                        placeholder="label title"
                      />
                    </div>
                    <Button
                      type="submit"
                      dispatch={loading}
                      className="primary-btn v-fit mb-3 py-2 w-100"
                      onClick={labelValidation.handleSubmit}
                    >
                      {labelLoading ? "Loading..." : "Add"}
                    </Button>
                  </div>
                </Col>
              )}
              <Col xs={6}>
                <InputField
                  className=""
                  max={today}
                  fieldClass="d-flex align-items-center"
                  name="date"
                  id="date"
                  label="date"
                  type="date"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.date}
                  invalid={validation.touched.date && validation.errors.date}
                  errorMessage={validation.errors.date}
                />
              </Col>
              <Col xs={6} className="ps-0 ps-md-2">
                <InputField
                  className=""
                  fieldClass="d-flex align-items-center"
                  name="time"
                  id="time"
                  label="time"
                  type="time"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.time}
                  invalid={validation.touched.time && validation.errors.time}
                  errorMessage={validation.errors.time}
                  placeholder="0"
                />
              </Col>
              {isMoreOption ? (
                <span
                  className="mt-2 mb-2 ms-auto w-fit cursor-pointer text-color-primary fs-14 user-select-none"
                  onClick={() => setIsMoreOption(false)}
                >
                  <i className="ri-subtract-line fs-18"></i>
                  More Details
                </span>
              ) : (
                <span
                  className="mt-2 mb-2 ms-auto w-fit cursor-pointer text-color-primary fs-14 user-select-none"
                  onClick={() => setIsMoreOption(true)}
                >
                  <i className="ri-add-line fs-18"></i>
                  More Details
                </span>
              )}
              {isMoreOption ? (
                <>
                  <Col xs={12}>
                    <div className="d-flex align-items-center gap-2">
                      {/* <InputField
                      name="payee"
                      id="payee"
                      label="payee"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.payee}
                      invalid={
                        validation.touched.payee && validation.errors.payee
                      }
                      errorMessage={validation.errors.payee}
                      placeholder="enter payee name"
                    /> */}
                      <SelectField
                        optional
                        className="mb-4 w-100"
                        name="payee"
                        id="payee"
                        label="payee"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.payee}
                        invalid={
                          validation.touched.payee && validation.errors.payee
                        }
                        errorMessage={validation.errors.payee}
                      >
                        <option value="">Select Payee</option>;
                        {!payeeData?.length && (
                          <option value="" disabled>
                            No Options
                          </option>
                        )}
                        {payeeData?.map((item, index) => {
                          const name = item?.name;
                          const business = item?.business;
                          return (
                            <option key={index} value={item?._id}>
                              {name + `${business ? ` -- ${business}` : ""}`}
                            </option>
                          );
                        })}
                      </SelectField>
                      <Link
                        onClick={handleCloseModal}
                        to={ADMIN.PAYEE.PATH}
                        className={`d-flex align-items-center justify-content-center border-0 v-fit br-10 p-0 min-wh-40px mt-2 primary-btn cursor-pointer`}
                      >
                        <i className="fw-bold fs-5 ri-add-line"></i>
                      </Link>
                    </div>
                  </Col>
                  <Col xs={12} className="mb-3 resize-none">
                    <TextAreaField
                      optional
                      label="notes"
                      placeholder="Notes here..."
                      name="note"
                      id="note"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.note}
                    />
                  </Col>
                  <Col xs={12}>
                    <SelectField
                      label="payment type"
                      name="paymentType"
                      id="paymentType"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.paymentType}
                      invalid={
                        validation.touched.paymentType &&
                        validation.errors.paymentType
                      }
                      errorMessage={validation.errors.paymentType}
                    >
                      <option value="CASH">Cash</option>
                      <option value="DEBIT_CARD">Debit Card</option>
                      <option value="CREDIT_CARD">Credit Card</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="MOBILE_PAYMENT">Mobile Payment</option>
                      <option value="WEB_TRANSFER">Mobile Transfer</option>
                    </SelectField>
                  </Col>
                  <Col xs={12}>
                    <SelectField
                      label="payment status"
                      name="status"
                      id="status"
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.status}
                      invalid={
                        validation.touched.status && validation.errors.status
                      }
                      errorMessage={validation.errors.status}
                    >
                      <option value="CLEARED">Cleared</option>
                      <option value="RECONCILED">Reconciled</option>
                      <option value="UNCLEARED">Uncleared</option>
                    </SelectField>
                  </Col>
                  <Col xs={12}>
                    <label
                      htmlFor={
                        validation.values.photo ? "" : "image-attachment"
                      }
                      className="mb-3 d-flex align-items-center justify-content-between"
                    >
                      <span
                        className="fs-16 text-color-primary cursor-pointer"
                        onClick={validation.values.photo && handleIsPreview}
                      >
                        {awsLoading ? (
                          "Loading..."
                        ) : validation.values.photo ? (
                          <span>
                            <ButtonToolbar className="d-inline">
                              <OverlayTrigger
                                placement="right"
                                overlay={
                                  <Tooltip id="tooltip">
                                    {isPreviw ? "Hide Preview" : "See Preview"}
                                  </Tooltip>
                                }
                              >
                                <span>Attached</span>
                              </OverlayTrigger>
                            </ButtonToolbar>
                          </span>
                        ) : (
                          "Attach image"
                        )}
                      </span>
                      <input
                        id="image-attachment"
                        type="file"
                        accept=".png, .jpg, .jpeg, .webp"
                        className="d-none"
                        onChange={handlePhotoAttachment}
                      />
                      <span>
                        {validation.values.photo && (
                          <ButtonToolbar className="d-inline">
                            <OverlayTrigger
                              placement="left"
                              overlay={
                                <Tooltip id="tooltip">Choose Image</Tooltip>
                              }
                            >
                              <label
                                htmlFor="image-attachment"
                                className="cursor-pointer ri-upload-cloud-line me-3 fs-18 text-color-primary"
                              ></label>
                            </OverlayTrigger>
                          </ButtonToolbar>
                        )}
                        <i
                          className={`${
                            isPreviw
                              ? "ri-arrow-down-s-line"
                              : "ri-arrow-right-s-line"
                          } fs-19 cursor-pointer`}
                          onClick={validation.values.photo && handleIsPreview}
                        ></i>
                      </span>
                    </label>
                    {/* {isPreviw ? ( */}
                    {isPreviw && validation.values.photo ? (
                      <div>
                        <img
                          className="br-10  mx-auto d-block mb-4 max-w-80p"
                          src={
                            import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                            validation.values.photo
                          }
                          alt="image"
                        />
                      </div>
                    ) : null}
                  </Col>
                </>
              ) : null}
            </Row>

            {isTransactionAction({ id: validation.values.account }) ? (
              <Button
                className="w-100 primary-btn fs-16"
                type="submit"
                disabled={loading || awsLoading}
              >
                {loading ? "Loading..." : "Save"}
              </Button>
            ) : (
              <Button
                className="w-100 primary-btn fs-16"
                type="submit"
                disabled
              >
                {"You have No access"}
              </Button>
            )}

            {!isDuplicate &&
              isEdit &&
              isTransactionAction({ id: validation.values.account }) && (
                <span className="d-block text-center w-100 fs-14 text-color-light-gray mt-2 pt-1">
                  <span className="cursor-pointer" onClick={handleDeleteRecord}>
                    <i className="ri-delete-bin-line"></i> Delete Record
                  </span>
                </span>
              )}
          </Modal.Body>
        </Form>
      </Modal>

      {/* category modal */}

      <SelectCategoryModal
        open={handleOpen}
        close={handleHideDirect}
        isOpen={isCategoryModal}
        onHide={handleCloseCategoryModal}
        onSelectCategory={onSelectCategory}
        filterKey={
          validation.values.type !== transactionTypeEnum.TRANSFER
            ? validation.values.type
            : ""
        }
      />

      {/* premium modal */}

      <PremiumModal
        isShow={premiumModal}
        onHide={() => {
          open();
          // setModalShow(true);
          setPremiumModal(false);
        }}
      />

      {/* payee modal */}

      {/* <PayeeModal
        show={isPayeeModal}
        onHide={() => setIsPayeeModal(false)}
        isLoading={payeeLoading}
      /> */}

      <DeleteRecordModal
        isOpen={isDelete}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        data={[item]}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </>
  );
};

AddEditRecord.propTypes = {
  isOpen: PropTypes.bool,
  onHide: PropTypes.func,
  item: PropTypes.object,
  templateData: PropTypes.object,
  customFunction: PropTypes.func,
  onSuccess: PropTypes.func,
  onDeleteSuccess: PropTypes.func,
  isDuplicate: PropTypes.bool,
};

export default memo(AddEditRecord);
