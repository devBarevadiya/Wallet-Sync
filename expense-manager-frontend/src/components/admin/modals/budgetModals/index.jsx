import { useCallback, useEffect, useMemo, useState } from "react";
import ModelWrapper from "../../../ModelWrapper";
import PropTypes from "prop-types";
import { Button, Form, Modal } from "react-bootstrap";
import * as yup from "yup";
import { useFormik } from "formik";
import InputField from "../../../inputFields/InputField";
import {
  budgetStatusType,
  eventEnum,
  periodEnum,
} from "../../../../helpers/enum";
import SelectAccountModal from "../plannedPaymentModals/SelectAccountModal";
import HeadCategoryModal from "./HeadCategoryModal";
import { useDispatch } from "react-redux";
import {
  clearCategoryData,
  setSelectHeadCategory,
  setSelectedSubCategory,
  setValue,
} from "../../../../store/budget/slice";
import { useSelector } from "react-redux";
import {
  deleteBudgetThunk,
  updateBudgetThunk,
} from "../../../../store/actions";
import useConfirmationAlert from "../../sweetAlerts/ConfirmationAlert";
import { useNavigate } from "react-router-dom";
import { ADMIN } from "../../../../constants/routes";
import { handleNumericInput } from "../../../../helpers/commonFunctions";
import CommonDeleteModal from "../deleteModals/CommonDeleteModal";
import { handleFirebaseEvent } from "../../../../firebase/config";
import { useModalScroll } from "../../../../helpers/customHooks";

const BudgetModal = ({
  editData = {},
  onClose,
  isOpen,
  open,
  onSuccess,
  close,
}) => {
  const { values, loading, transactionData, actionLoading } = useSelector(
    (state) => state.Budget
  );
  const [currentModal, setCurrentModal] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [isDelete, setIsDelete] = useState(false);
  const [isAlert, setIsAlert] = useState(false);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const spentAmount = transactionData?.spendAmount || 0;
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  isOpen && handleFirebaseEvent(eventEnum.BUDGET_INIT);

  const isEdit = useMemo(
    () => (Object?.keys(editData)?.length > 0 ? true : false),
    [editData]
  );

  const handleOpenAlert = useCallback(() => {
    setIsAlert(true);
  }, []);

  const handleCloseAlert = useCallback(() => {
    setIsAlert(false);
  }, []);

  const handleCurrentModal = (value) => {
    // onClose();
    close ? close() : onClose();
    setCurrentModal(value);
  };

  const handleCloseCurrentModal = () => {
    open();
    setCurrentModal("");
  };

  const closeCurrentDirectly = () => {
    setCurrentModal("");
  };

  const initialValues = {
    name: editData?.name || "",
    period: editData?.period || periodEnum.WEEKLY || "",
    accounts: editData?.accounts?.map((item) => item?._id) || [],
    maxAmount: editData?.maxAmount || "",
  };

  const validationSchema = yup.object({
    name: yup.string().required("name is required"),
    period: yup.string().required("period is required"),
    maxAmount: yup
      .number()
      .min(1, "enter positive value")
      .required("enter valid amount"),
    accounts: yup
      .array()
      .min(1, "You must select at least one account")
      .required("account is required"),
  });

  const validation = useFormik({
    name: "buddgetValidation",
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (value) => {
      if (!isEdit) {
        handleCurrentModal("selectHeadCategory");
        dispatch(setValue({ ...values, ...value }));
      } else {
        // if (spentAmount > value.maxAmount) {
        //   handleOpenAlert();
        // }
        const response = await dispatch(
          updateBudgetThunk({ id: editData?._id, values: value })
        );
        if (updateBudgetThunk?.fulfilled?.match(response)) {
          onSuccess && onSuccess();
          closeModal();
        }
      }
    },
  });

  const periodData = [
    { title: "Weekly", value: periodEnum.WEEKLY },
    { title: "Monthly", value: periodEnum.MONTHLY },
    { title: "Yearly", value: periodEnum.YEARLY },
    { title: "One Time", value: periodEnum.ONE_TIME },
  ];

  const handleRemoveLabel = useCallback(
    (e, id) => {
      e.stopPropagation();
      const newAccount = accounts.filter((label) => label._id !== id);
      setAccounts(newAccount);

      validation.setFieldValue(
        "accounts",
        newAccount?.map((item) => item?._id)
      );
    },
    [accounts]
  );

  const addAccountFieldValue = useCallback((value) => {
    validation.setFieldValue("accounts", value?.map((item) => item?._id) || "");
    setAccounts(value);
  }, []);

  const closeModal = useCallback(() => {
    handleFirebaseEvent(eventEnum.BUDGET_CANCELLED);
    dispatch(setSelectHeadCategory({}));
    dispatch(setSelectedSubCategory({}));
    dispatch(clearCategoryData());
    setAccounts([]);
    validation.resetForm();
    onClose();
  }, [onClose]);

  const triggerDeleteRecord = useConfirmationAlert({
    icon: "warning",
    title: "Confirm Budget Delete",
    text: "Are you sure you want to delete this Budget? This change cannot be undone.",
    confirmButtonText: "Delete Budget",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "Record has been successfully deleted.",
  });

  const handleDeleteBudget = async () => {
    // triggerDeleteRecord({
    //   dispatchFunction: async () => {
    //     const response = await dispatch(deleteBudgetThunk(editData?._id));
    //     if (deleteBudgetThunk.fulfilled.match(response)) {
    //       nav(ADMIN.BUDGET.PATH);
    //       return true;
    //     }
    //   },
    // });
    setIsDelete(true);
  };

  const updateData = useCallback(async () => {
    const response = await dispatch(
      updateBudgetThunk({
        id: editData?._id,
        values: {
          status:
            editData?.status == budgetStatusType.OPEN
              ? budgetStatusType.CLOSE
              : budgetStatusType?.OPEN,
        },
      })
    );
    if (updateBudgetThunk.fulfilled.match(response)) {
      onSuccess && onSuccess();
      closeModal();
    }
  }, [editData, closeModal, dispatch, onSuccess]);

  const onSuccessCategory = useCallback(() => {
    onSuccess && onSuccess();
    validation.resetForm();
    setAccounts([]);
  }, [onSuccess]);

  const handleConfirm = useCallback(async () => {
    const response = await dispatch(deleteBudgetThunk(editData?._id));
    if (deleteBudgetThunk.fulfilled.match(response)) {
      nav(ADMIN.BUDGET.PATH);
      return true;
    }
    return false;
  }, [dispatch, editData, nav]);

  const handleCloseDeleteModal = useCallback(() => setIsDelete(false), []);

  useEffect(() => {
    // setAccounts(editData?.accounts);
    if (editData?.accounts && editData?.accounts.length > 0) {
      setAccounts(editData.accounts);
    }
  }, [editData]);

  return (
    <>
      <ModelWrapper
        show={isOpen}
        onHide={closeModal}
        className="modal-650px responsive"
        title={`${isEdit ? "Edit" : "Add"}  Budget`}
      >
        <Form onSubmit={validation.handleSubmit}>
          <Modal.Body ref={modalBodyRef}>
            <Form.Group className="mb-4">
              <Form.Control
                className={`text-center pt-3 pb-2 bg-transparent client-section-bg-color rounded-4 fs-45 fw-semibold border-0`}
                type="number"
                title="amount"
                name="maxAmount"
                inputMode="numeric"
                id="maxAmount"
                placeholder="0"
                onInput={handleNumericInput}
                min={0}
                autoComplete="off"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.maxAmount}
              />
              {validation.errors.maxAmount && (
                <span className="text-color-invalid fs-12 text-capitalize mt-1 d-block">
                  {validation.errors.maxAmount}
                </span>
              )}
            </Form.Group>
            <InputField
              type="text"
              name="name"
              id="name"
              label="Budget Name"
              placeholder="Enter Name"
              className="mb-3"
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.name}
              invalid={validation.touched.name && validation.errors.name}
              errorMessage={validation.errors.name}
            />
            <div className="mb-3">
              <span className="fs-16 form-label">Budget Period</span>
              <ul className="m-0 p-0 d-flex align-items-center gap-2 gap-sm-3 mt-2">
                {periodData?.map((item, index) => {
                  const title = item?.title;
                  const value = item?.value;
                  return (
                    <li
                      onClick={() => validation.setFieldValue("period", value)}
                      key={index}
                      className={`${
                        validation.values.period == value
                          ? "border-color-primary light-primary-bg"
                          : "common-border-color"
                      } border br-8 w-100 text-center py-3 fs-16 cursor-pointer`}
                    >
                      {title}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="text-break">
              <span className="text-capitalize fs-16 d-block mb-2 form-label">
                Account
              </span>
              <span
                onClick={() => {
                  handleCurrentModal("selectAccount");
                  validation.setFieldError("accounts", true);
                }}
                className={`border ${
                  validation.touched.accounts && validation.errors.accounts
                    ? "border-color-invalid"
                    : "common-border-color"
                }
                  br-10 d-block w-100 d-flex align-items-center form-control cursor-pointer`}
              >
                <ul className="m-0 p-0 d-flex flex-wrap gap-2 ">
                  {accounts?.length
                    ? accounts?.map((item, index) => {
                        const title = item?.title;
                        const id = item?._id;
                        //   const color = item?.color;
                        return (
                          <li
                            key={index}
                            className="text-white px-2 br-8 py-1 bg-color-primary"
                            //   style={{ backgroundColor: color }}
                            onClick={(e) => handleRemoveLabel(e, id)}
                          >
                            {title}
                            <i className="ri-close-line fw-bold ms-2"></i>
                          </li>
                        );
                      })
                    : "Select Accounts"}
                </ul>
                <span className="ms-auto ps-3">
                  <i className="ri-arrow-right-s-line fs-21"></i>
                </span>
              </span>
              {validation.touched.accounts && validation.errors.accounts && (
                <span className="text-color-invalid fs-12 text-capitalize mt-1 d-block">
                  {validation.errors.accounts}
                </span>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer className="pt-0 bg-white px-2 px-sm-3 rounded-4">
            {isEdit ? (
              <div className="d-flex flex-column-reverse flex-sm-row gap-2 align-items-center w-100 justify-content-between">
                <span
                  className="text-color-red cursor-pointer"
                  onClick={handleDeleteBudget}
                >
                  <i className="ri-delete-bin-line me-2 fs-18"></i>
                  <span className="fs-16">Delete Budget</span>
                </span>
                <div className="d-flex gap-2 flex-wrap flex-sm-nowrap">
                  <Button
                    onClick={updateData}
                    className="w-100  justify-content-center light-gray-btn text-nowrap d-flex align-items-center"
                  >
                    <i
                      className={`${
                        editData?.status == budgetStatusType.OPEN
                          ? "ri-close-circle-line"
                          : "checkbox-circle-line"
                      } me-2 fs-21`}
                    ></i>
                    <span className="fs-16">
                      {editData?.status == budgetStatusType.OPEN
                        ? "Close Budget"
                        : "Open Budget"}
                    </span>
                  </Button>
                  <Button
                    disabled={actionLoading}
                    className="w-100 primary-btn fs-16"
                    type="submit"
                  >
                    {actionLoading ? "Loading..." : "Continue"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                disabled={actionLoading}
                className="w-100 primary-btn"
                type="submit"
              >
                {actionLoading ? "Loading..." : "Continue"}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </ModelWrapper>
      <SelectAccountModal
        isOpen={currentModal == "selectAccount"}
        onClose={handleCloseCurrentModal}
        onSelectValue={addAccountFieldValue}
        multivalue
        value={accounts}
      />
      {/* {currentModal == "selectHeadCategory" &&  */}
      <HeadCategoryModal
        isOpen={currentModal == "selectHeadCategory"}
        onClose={handleCloseCurrentModal}
        open={() => handleCurrentModal("selectHeadCategory")}
        close={closeCurrentDirectly}
        onSuccess={onSuccessCategory}
      />
      {/* // } */}

      <CommonDeleteModal
        isOpen={isDelete}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Delete Budget",
          description: "Are you sure you want to delete the Budget?",
        }}
        onConfirm={handleConfirm}
        loading={loading}
      />

      <CommonDeleteModal
        isOpen={isAlert}
        onClose={handleCloseAlert}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Over-Budget Limit Reached",
          description: `A minimum budget of ${spentAmount} is required to proceed with the budget update.`,
          confirmText: "Okay!",
          cancelText: "Close",
        }}
        onConfirm={handleCloseAlert}
        loading={loading}
      />
    </>
  );
};

BudgetModal.propTypes = {
  editData: PropTypes.object,
  onClose: PropTypes.func,
  isOpen: PropTypes.bool,
  open: PropTypes.func,
  onSuccess: PropTypes.func,
  close: PropTypes.func,
};

export default BudgetModal;
