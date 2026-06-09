import { useCallback, useEffect, useMemo, useState } from "react";
import ModelWrapper from "../../ModelWrapper";
import PropTypes from "prop-types";
import * as yup from "yup";
import { useFormik } from "formik";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { groupAccessEnum, transactionTypeEnum } from "../../../helpers/enum";
import InputField from "../../inputFields/InputField";
import SelectField from "../../inputFields/SelectField";
import { useSelector } from "react-redux";
import { getCurrencyThunk } from "../../../store/currency/thunk";
import { useDispatch } from "react-redux";
import SelectCategoryModal from "./SelectCategoryModal";
import { isTransactionAction } from "../../../helpers/commonFunctions";
import TextAreaField from "../../inputFields/TextAreaField";
import {
  createTemplateThunk,
  deleteTemplateThunk,
  editTemplateThunk,
  getTemplateThunk,
} from "../../../store/template/thunk";
import CommonDeleteModal from "./deleteModals/CommonDeleteModal";
import { IconsImage } from "../../../data/images";
import { getAllPayeeThunk, getLabelThunk } from "../../../store/actions";
import { useModalScroll } from "../../../helpers/customHooks";

const TemplateModal = ({
  isOpen,
  editData,
  onClose,
  onSuccess,
  open,
  close,
}) => {
  const { data: accountData } = useSelector((store) => store.Account);
  const { flatData } = useSelector((store) => store.Currency);
  const { singleUserGroupData } = useSelector((store) => store.Group);
  const { chartData } = useSelector((store) => store.Dashboard);
  const { data: labelData } = useSelector((store) => store.Label);
  const { data: payeeData } = useSelector((store) => store.Payee);
  const { loading } = useSelector((store) => store.Template);
  const { uploadLoading: awsLoading } = useSelector((store) => store.Aws);
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const isEdit = useMemo(
    () => (Object.keys(editData)?.length > 0 ? true : false),
    [editData]
  );
  const dispatch = useDispatch();
  const [isCategoryModal, setIsCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedOption, setSelectedOption] = useState([]);
  const [isMoreOption, setIsMoreOption] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  const handleCloseModal = useCallback(() => {
    onClose(),
      setIsMoreOption(false),
      setSelectedCategory(""),
      selectedOption([]);
    open();
  }, [onClose, open, selectedOption]);

  const handleFindCurrency = (value) => {
    return accountData?.filter((ele) => ele?._id == value)?.[0]?.currency?._id;
  };

  const localFromAcc =
    !isEdit &&
    !chartData?.accounts?.length &&
    accountData?.some((value) => value?._id == localStorage.getItem("fromAcc"))
      ? localStorage.getItem("fromAcc")
      : false;

  const initialValues = {
    title: editData?.title || "",
    labels:
      editData?.labels?.reduce((acc, item) => [...acc, item._id], []) || [],
    account:
      localFromAcc ||
      chartData?.accounts?.[0] ||
      editData?.account?._id ||
      accountData?.[0]?._id ||
      "",
    amount: editData?.amount || "",
    currency:
      handleFindCurrency(
        localFromAcc ||
          chartData?.accounts?.[0] ||
          editData?.account?._id ||
          accountData?.[0]?._id
      ) ||
      editData?.account?.currency?._id ||
      accountData?.[0]?.currency?._id ||
      "",
    category: editData?.category?._id || "",
    type: editData?.type || transactionTypeEnum.EXPENSE || "",
    //  other details values
    payWith: editData?.payWith?._id || null,
    note: editData?.note || "",
    paymentType: editData?.paymentType || "CASH",
  };

  const validationSchema = yup.object({
    title: yup.string().required("title is required"),
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
  });

  const validation = useFormik({
    name: "record-validation",
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      values.amount = Number(values.amount);
      const allValues = values;

      // expense
      if (values.type !== transactionTypeEnum.TRANSFER) delete values.to;

      if (isEdit) {
        // delete values.payWith;
        // delete values.note;
        const response = await dispatch(
          editTemplateThunk({
            id: editData._id,
            values: {
              ...allValues,
              ...(!allValues?.payWith
                ? { payWith: null }
                : { payWith: allValues?.payWith }),
            },
          })
        );
        if (editTemplateThunk.fulfilled.match(response)) {
          setSelectedCategory("");
          onSuccess && onSuccess();
          handleCloseModal();
          resetForm();
        }
      } else {
        let filteredValue = allValues;
        (!values.payWith || values.payWith == null) &&
          delete filteredValue.payWith;
        const response = await dispatch(createTemplateThunk(filteredValue));
        if (createTemplateThunk.fulfilled.match(response)) {
          setSelectedCategory("");
          await dispatch(getTemplateThunk());
          onSuccess && onSuccess();
          handleCloseModal();
          resetForm();
        }
      }

      localStorage.setItem("fromAcc", values.account);
    },
  });

  const handleTransactionTab = (value) => {
    validation.setFieldValue("type", value);
  };

  const handleOpenCategoryModal = useCallback(() => {
    setIsCategoryModal(true), close();
  }, [close]);

  const handleCloseCategoryModal = useCallback(() => {
    setIsCategoryModal(false), open();
  }, [open]);

  const handleCloseCategoryModalDirect = useCallback(() => {
    setIsCategoryModal(false);
  }, []);

  const handleOpenCategoryModalDirect = useCallback(() => {
    setIsCategoryModal(true);
  }, []);

  const onSelectCategory = useCallback(
    (e) => {
      validation.setFieldValue("category", e._id);
      setSelectedCategory(e.title);
    },
    [validation]
  );

  const onMultipleLabelSelect = useCallback(
    (value) => {
      validation.setFieldValue(
        "labels",
        value?.reduce((acc, item) => [...acc, item.value], [])
      );
      setSelectedOption(value);
    },
    [validation]
  );

  const handleCloseDeleteModal = useCallback(() => setIsDelete(false), []);

  const handleOpenDelete = useCallback(() => setIsDelete(true), []);

  const handleConfirm = useCallback(async () => {
    await dispatch(deleteTemplateThunk(editData?._id));
    handleCloseDeleteModal();
    handleCloseModal();
  }, [dispatch, editData, handleCloseDeleteModal, handleCloseModal]);

  useEffect(() => {
    if (isOpen && !flatData?.length > 0) {
      dispatch(getCurrencyThunk());
    }

    if (editData?.category?.title) {
      setSelectedCategory(editData?.category?.title || "");
    }

    if (isOpen && !labelData?.length > 0) {
      dispatch(getLabelThunk());
    }

    if (isOpen && !payeeData?.length) {
      dispatch(getAllPayeeThunk());
    }

    if (editData?.labels?.length > 0) {
      const modifiedVal = editData?.labels?.reduce(
        (acc, item) => [...acc, { value: item._id, label: item.title }],
        []
      );
      setSelectedOption(modifiedVal);
    } else {
      setSelectedOption([]);
    }
  }, [isOpen]);

  return (
    <>
      <ModelWrapper
        show={isOpen}
        onHide={handleCloseModal}
        title={isEdit ? "Edit template" : "add template"}
        className="modal-650px responsive"
      >
        <Modal.Body ref={modalBodyRef} className="pb-3">
          <Form onSubmit={validation.handleSubmit}>
            <Row>
              <InputField
                label="Name"
                placeholder="Template Name"
                value={validation.values.title}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                name="title"
                id="title"
                invalid={validation.touched.title && validation.errors.title}
                errorMessage={validation.errors.title}
              />
              <div>
                <div className="mb-3 border text-center fs-16 common-border-color w-100 user-select-none fw-medium client-section-bg-color d-flex w-fit br-10 overflow-hidden p-1 p-sm-2">
                  <span
                    className={`col-6 py-2 px-3  ${
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
                    className={`col-6 py-2 px-3  ${
                      validation.values.type == transactionTypeEnum.INCOME
                        ? "bg-white br-8 common-border-color border dark-text-color"
                        : "text-color-dusty-gray"
                    } d-block  common-border-color cursor-pointer`}
                    onClick={() =>
                      handleTransactionTab(transactionTypeEnum.INCOME)
                    }
                  >
                    Income
                  </span>
                </div>
              </div>
              <Col xs={12}>
                <SelectField
                  label="account"
                  name="account"
                  id="account"
                  value={validation.values.account || accountData[0]?._id || ""}
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
                      singleUserGroupData?.member?.accounts[index]?.permission;
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
              <Col xs={6} sm={8}>
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
                  className="mb-3"
                  onBlur={validation.handleBlur}
                  value={selectedCategory}
                  fieldClass="cursor-pointer"
                  postIcon={<i className="ri-arrow-down-s-line"></i>}
                  invalid={
                    validation.touched.category && validation.errors.category
                  }
                  errorMessage={validation.errors.category}
                />
              </Col>
              <span
                className=" mb-3 ms-auto w-fit cursor-pointer text-color-primary fs-14 user-select-none"
                onClick={() => setIsMoreOption(isMoreOption ? false : true)}
              >
                <i
                  className={`${
                    isMoreOption ? "ri-subtract-line" : "ri-add-line"
                  }  fs-18`}
                ></i>
                More Details
              </span>

              {isMoreOption ? (
                <>
                  <Col xs={12}>
                    <div className="d-flex align-items-end mb-4 gap-2 w-100">
                      <SelectField
                        optional
                        className="w-100"
                        multipleSelect
                        name="labels"
                        id="labels"
                        label="labels"
                        onChange={onMultipleLabelSelect}
                        onBlur={validation.handleBlur}
                        value={selectedOption}
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
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="d-flex align-items-center gap-2">
                      <SelectField
                        optional
                        className="mb-4 w-100"
                        name="payWith"
                        id="payWith"
                        label="pay with"
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.payWith}
                        invalid={
                          validation.touched.payWith &&
                          validation.errors.payWith
                        }
                        errorMessage={validation.errors.payWith}
                      >
                        <option value="">Select payWith</option>;
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
                </>
              ) : (
                ""
              )}

              {isTransactionAction({ id: validation.values.account }) ? (
                <div className="mb-2">
                  <Button
                    className="w-100 primary-btn fs-16"
                    type="submit"
                    disabled={loading || awsLoading}
                  >
                    {loading ? "Loading..." : "Save"}
                  </Button>
                </div>
              ) : (
                <div className="mb-2">
                  <Button className="w-100 primary-btn fs-16" disabled>
                    {"You have No access"}
                  </Button>
                </div>
              )}
              {isEdit &&
                isTransactionAction({ id: validation.values.account }) && (
                  <span className="d-block text-center w-100 fs-13 text-color-light-gray  pt-2">
                    <span className="cursor-pointer" onClick={handleOpenDelete}>
                      <i className="ri-delete-bin-line"></i> Delete Record
                    </span>
                  </span>
                )}
            </Row>
          </Form>
        </Modal.Body>
      </ModelWrapper>

      <SelectCategoryModal
        open={handleOpenCategoryModalDirect}
        close={handleCloseCategoryModalDirect}
        isOpen={isCategoryModal}
        onHide={handleCloseCategoryModal}
        onSelectCategory={onSelectCategory}
        filterKey={
          validation.values.type !== transactionTypeEnum.TRANSFER
            ? validation.values.type
            : ""
        }
      />

      <CommonDeleteModal
        isOpen={isDelete}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        content={{ title: "Are you sure you want to Delete the Template?" }}
        onConfirm={handleConfirm}
        loading={loading}
        icon={IconsImage.other.record}
      />
    </>
  );
};

TemplateModal.propTypes = {
  isOpen: PropTypes.bool,
  editData: PropTypes.object,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
};

export default TemplateModal;
