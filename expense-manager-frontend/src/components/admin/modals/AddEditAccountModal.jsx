import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import ModelWrapper from "../../ModelWrapper";
import PropTypes from "prop-types";
import InputField from "../../inputFields/InputField";
import SelectField from "../../inputFields/SelectField";
import { useDispatch, useSelector } from "react-redux";
import { memo, useCallback, useEffect, useState } from "react";
import { getCurrencyThunk } from "../../../store/currency/thunk";
import { getAccountTypeThunk } from "../../../store/accountType/thunk";
import * as yup from "yup";
import { useFormik } from "formik";
import {
  deleteAccountThunk,
  getAccountThunk,
  postAccountThunk,
  updateAccountThunk,
} from "../../../store/account/thunk";
import useConfirmationAlert from "../sweetAlerts/ConfirmationAlert";
import CommonDeleteModal from "./deleteModals/CommonDeleteModal";
import { handleFirebaseEvent } from "../../../firebase/config";
import { eventEnum } from "../../../helpers/enum";
import { useModalScroll } from "../../../helpers/customHooks";

const AddEditAccountModal = ({
  isOpen,
  onHide,
  item = {},
  onSuccess,
  onDelete,
}) => {
  const { data, flatData } = useSelector((store) => store.Currency);
  const { data: accountData } = useSelector((store) => store.AccountType);
  const { loading } = useSelector((store) => store.Account);
  const { baseCurrency } = useSelector((store) => store.Auth);
  const dispatch = useDispatch();
  const userCurrency = baseCurrency?._id || baseCurrency?.currency;
  const isEdit = Object?.keys(item)?.length > 0;
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const [isDelete, setIsDelete] = useState(false);
  isOpen && handleFirebaseEvent(eventEnum.ACCOUNT_INIT);

  const handleHideModal = useCallback(() => {
    onHide();
    handleFirebaseEvent(eventEnum.ACCOUNT_CANCELLED);
  }, [onHide]);

  const initialValues = {
    title: item?.title || "",
    balance: item?.balance || "",
    currency: item?.currency?._id || userCurrency || flatData?.[0]?._id || "",
    accountType: item?.accountType?._id || accountData[0]?._id || "",
    color: "#FAF2FF",
    // isArchive: false,
  };

  const validationSchema = yup.object({
    title: yup.string().required(),
    balance: yup.number(),
    currency: yup.string().required("currency is required"),
    accountType: yup.string().required("accountType is required"),
    color: yup.string().required("color is required"),
  });

  const validation = useFormik({
    name: "add-edit-validation",
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      values.title = values.title.trim();
      if (!values.balance > 0) {
        values.balance = 0;
      }
      if (isEdit) {
        const response = await dispatch(
          updateAccountThunk({ values, id: item?._id })
        );
        if (updateAccountThunk.fulfilled.match(response)) {
          const response = await dispatch(getAccountThunk());
          if (getAccountThunk.fulfilled.match(response)) {
            handleHideModal();
            resetForm();
            onSuccess && onSuccess();
          }
        }
        return;
      }
      const response = await dispatch(postAccountThunk(values));
      if (postAccountThunk.fulfilled.match(response)) {
        handleFirebaseEvent(eventEnum.ACCOUNT_CREATED);
        const getResponse = await dispatch(getAccountThunk());
        if (getAccountThunk.fulfilled.match(getResponse)) {
          handleHideModal();
          resetForm();
          onSuccess && onSuccess(response.payload);
        }
      }
    },
  });

  const triggerDeleteAccount = useConfirmationAlert({
    icon: "warning",
    title: "Confirm Account Delete",
    text: "Are you sure you want to delete this account? This change cannot be undone.",
    confirmButtonText: "Delete Account",
    cancelButtonText: "Not Now",
    confirmButton: "sweet-alert-red-button",
    cancelButton: "sweet-alert-green-button",

    successText: "Account has been successfully deleted.",
  });

  const handleDeleteAccount = () => {
    // triggerDeleteAccount({
    //   dispatchFunction: async () => {
    //     const response = await dispatch(deleteAccountThunk(item?._id));
    //     if (deleteAccountThunk.fulfilled.match(response)) {
    //       onDelete();
    //       onHide();
    //       return true;
    //     }
    //     return false;
    //   },
    // });

    setIsDelete(true);
  };

  const handleConfirm = useCallback(async () => {
    const response = await dispatch(deleteAccountThunk(item?._id));
    if (deleteAccountThunk.fulfilled.match(response)) {
      onDelete();
      handleHideModal();
      return true;
    }
    return false;
  }, [item, onDelete, dispatch, handleHideModal]);

  const handleCloseDeleteModal = useCallback(() => setIsDelete(false), []);

  useEffect(() => {
    if (isOpen && !data?.length > 0) {
      dispatch(getCurrencyThunk());
    }
    if (isOpen && !accountData?.length > 0) {
      dispatch(getAccountTypeThunk());
    }
    validation.resetForm();
  }, [isOpen]);

  return (
    <>
      <ModelWrapper
        show={isOpen}
        onHide={handleHideModal}
        title={isEdit ? "edit account" : "add account"}
        className="modal-650px"
      >
        <Form onSubmit={validation.handleSubmit}>
          <Modal.Body ref={modalBodyRef} className="">
            <Row className="px-1">
              <Col sm={8}>
                <InputField
                  name="title"
                  id="title"
                  label="name"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.title}
                  invalid={validation.touched.title && validation.errors.title}
                  errorMessage={validation.errors.title}
                  placeholder="Account name"
                />
              </Col>
              <Col xs={6} sm={4}>
                <SelectField
                  disabled={isEdit}
                  name="currency"
                  id="currency"
                  label="currency"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
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
              <Col xs={6}>
                <SelectField
                  name="accountType"
                  id="accountType"
                  label="account Type"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.accountType}
                  invalid={
                    validation.touched.accountType &&
                    validation.errors.accountType
                  }
                  errorMessage={validation.errors.accountType}
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
              <Col xs={12} sm={6}>
                <InputField
                  label="initial amount"
                  type="text"
                  name="balance"
                  id="balance"
                  placeholder="0"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.balance}
                  invalid={
                    validation.touched.balance && validation.errors.balance
                  }
                  errorMessage={validation.errors.balance}
                  inputMode="numeric"
                />
              </Col>
              {/* <Col xs={12}>
              <ColorSelectField
                onChange={(value) => validation.setFieldValue("color", value)}
                inValid={validation.errors.color}
                errorMessage={validation.errors.color}
                value={validation.values.color}
                label="color"
                className="d-flex flex-wrap  gap-3"
                data={accountColor}
              />
            </Col> */}
            </Row>
            <div className="w-100 d-flex gap-3">
              <Button
                className="light-gray-btn w-100 fs-16 responsive"
                onClick={handleHideModal}
              >
                Cancel
              </Button>
              <Button
                className="primary-btn w-100 fs-16 responsive"
                type="submit"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </Modal.Body>
          {isEdit && (
            <span className="d-block text-center w-100 fs-13 text-color-light-gray pb-3">
              <span className="cursor-pointer" onClick={handleDeleteAccount}>
                <i className="ri-delete-bin-line"></i> Delete Account
              </span>
            </span>
          )}
        </Form>
      </ModelWrapper>

      <CommonDeleteModal
        isOpen={isDelete}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        content={{ description: "" }}
        onConfirm={handleConfirm}
        loading={loading}
      />
    </>
  );
};

AddEditAccountModal.propTypes = {
  isOpen: PropTypes.bool,
  onHide: PropTypes.func,
  edit: PropTypes.bool,
  item: PropTypes.object,
  onSelectValue: PropTypes.func,
  onSuccess: PropTypes.func,
  onDelete: PropTypes.func,
};

export default memo(AddEditAccountModal);
