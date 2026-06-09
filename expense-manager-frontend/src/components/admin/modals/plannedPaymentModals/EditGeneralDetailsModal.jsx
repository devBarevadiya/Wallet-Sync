import { Button, Form, Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import { memo, useCallback, useEffect, useState } from "react";
import {
  paymentStatusEnum,
  transactionTypeEnum,
} from "../../../../helpers/enum";
import InputField from "../../../inputFields/InputField";
import * as yup from "yup";
import { useFormik } from "formik";
import SelectAccountModal from "./SelectAccountModal";
import CustomCalanderModal from "./CustomCalanderModal";
import { formatDate } from "../../../../helpers/commonFunctions";
import { useDispatch } from "react-redux";
import { updatePaymentThunk } from "../../../../store/payment/thunk";
import { useSelector } from "react-redux";
import useConfirmationAlert from "../../sweetAlerts/ConfirmationAlert";
import CommonDeleteModal from "../deleteModals/CommonDeleteModal";
import { useModalScroll } from "../../../../helpers/customHooks";

const EditGeneralDetailsModal = ({
  isOpen,
  onClose,
  editData,
  open,
  handleCloseDirectly,
  onSuccess,
  transactionType,
  onPostpone,
  title,
}) => {
  const { actionLoading, loading } = useSelector((store) => store.Payment);

  const [accountTitle, setAccountTitle] = useState(
    editData?.account?.title || ""
  );

  const dispatch = useDispatch();
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const [currentSubModal, setCurrentSubModal] = useState("");
  const [isDelete, setIsDelete] = useState(false);

  const amount = editData?.amount;
  const paymentDate = editData?.paymentDate;
  const account = editData?.account?._id;
  const status = editData?.status;
  const editid = editData?._id;

  const initialValues = {
    paymentDate: new Date() || "",
    account: "",
    status: "",
    amount: 0,
  };

  const validationSchema = yup.object({
    paymentDate: yup.date().required(),
    account: yup.string().required(),
    status: yup.string().required(),
  });

  const validation = useFormik({
    name: "editGeneralDetailsValidation",
    initialValues,
    validationSchema,
    // enableReinitialize: true,
    onSubmit: async (values) => {
      const response = await dispatch(
        updatePaymentThunk({
          id: editid,
          values: {
            ...validation.values,
            paymentDate: formatDate(values.paymentDate, "YYYY-MM-DD"),
            status: paymentStatusEnum.CONFIRMED,
          },
        })
      );
      if (updatePaymentThunk.fulfilled.match(response)) {
        await onSuccess();
        onClose();
      }
    },
  });

  const handleOpenSubModal = useCallback(
    (value) => {
      setCurrentSubModal(value);
      // open();
      // onClose();
      handleCloseDirectly();
    },
    [handleCloseDirectly]
  );

  const handleCloseSubModal = useCallback(() => {
    open();
    setCurrentSubModal("");
  }, [setCurrentSubModal, open]);

  const addAccountFieldValue = useCallback((value) => {
    validation.setFieldValue("account", value?._id);
    setAccountTitle(value?.title);
  }, []);

  const handlePaymentDateValue = useCallback((value) => {
    validation.setFieldValue("paymentDate", value);
  }, []);

  const handleSavePostponeDate = useCallback(
    async (value) => {
      await dispatch(
        updatePaymentThunk({
          id: editid,
          values: {
            ...validation.values,
            paymentDate: formatDate(value, "YYYY-MM-DD"),
            status: paymentStatusEnum.PENDING,
          },
        })
      );
      onPostpone && (await onPostpone());
      handleCloseSubModal();
      onClose();
    },
    [editid, validation.values, handleCloseSubModal, onClose, dispatch]
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
    //     const response = await dispatch(
    //       updatePaymentThunk({
    //         id: editid,
    //         values: {
    //           ...validation.values,
    //           paymentDate: formatDate(
    //             validation.values.paymentDate,
    //             "YYYY-MM-DD"
    //           ),
    //           status: paymentStatusEnum.CANCELLED,
    //         },
    //       })
    //     );
    //     if (updatePaymentThunk.fulfilled.match(response)) {
    //       await onSuccess();
    //       onClose();
    //       validation.resetForm();
    //       return true;
    //     }
    //   },
    // });
    setIsDelete(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDelete(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    const response = await dispatch(
      updatePaymentThunk({
        id: editid,
        values: {
          ...validation.values,
          paymentDate: formatDate(validation.values.paymentDate, "YYYY-MM-DD"),
          status: paymentStatusEnum.CANCELLED,
        },
      })
    );
    if (updatePaymentThunk.fulfilled.match(response)) {
      await onSuccess();
      onClose();
      validation.resetForm();
      return true;
    }
    return false;
  }, [dispatch, editid, onClose, onSuccess, validation]);

  useEffect(() => {
    validation.setFieldValue("paymentDate", paymentDate);
    validation.setFieldValue("account", account);
    validation.setFieldValue("status", status);
    validation.setFieldValue("amount", amount);
  }, [editData]);

  return (
    <>
      <Modal
        show={isOpen}
        onHide={onClose}
        className="modal-650px responsive"
        title={title}
        centered
      >
        <Modal.Header
          closeButton
          className="border-bottom common-border-color py-3 model-close-btn-m-0"
        >
          <Modal.Title className="text-capitalize max-w-300px d-block text-truncate fs-21 responsive w-100 me-3">
            {title}
          </Modal.Title>
          <span
            className="text-color-invalid ms-auto fs-16 me-3 cursor-pointer"
            onClick={handleDeleteRecord}
          >
            Delete
          </span>
        </Modal.Header>
        <Form onSubmit={validation.handleSubmit}>
          <Modal.Body ref={modalBodyRef} className="px-0 pt-0">
            <span className="bg-color-primary w-100 text-white d-block text-center fs-45 fw-semibold user-select-none min-h-100px d-flex align-items-center justify-content-center text-truncate text-wrap text-break px-3">
              {amount > 0 &&
                (transactionType == transactionTypeEnum.EXPENSE ? "-" : "+")}
              {amount}
            </span>
            <div className="px-3 px-md-4">
              <h6 className="fs-19 pt-4 pb-3 text-color-light-gray">General</h6>
              {/* <InputField
                type="clickOnly"
                name="account"
                id="account"
                label="payment date"
                placeholder="Enter Name"
                value={
                  formatDate(validation.values.paymentDate, "DD MMMM YYYY") ||
                  "Select"
                }
                postIcon={<i className="ri-arrow-right-s-line fs-21"></i>}
                onClick={() => handleOpenSubModal("paymentDate")}
                invalid={
                  validation.touched.paymentDate &&
                  validation.errors.paymentDate
                }
                errorMessage={validation.errors.paymentDate}
              /> */}

              <InputField
                type="clickOnly"
                name="account"
                id="account"
                label="account"
                placeholder="Enter Name"
                value={accountTitle || editData?.account?.title || "Select"}
                postIcon={<i className="ri-arrow-right-s-line fs-21"></i>}
                onClick={() => handleOpenSubModal("selectAccount")}
                invalid={
                  validation.touched.account && validation.errors.account
                }
                errorMessage={validation.errors.account}
              />

              <h6 className="fs-19 my-4 text-color-light-gray">Actions</h6>

              <InputField
                type="clickOnly"
                name="account"
                id="account"
                isLable={false}
                placeholder="Enter Name"
                value={"Postpone"}
                postIcon={<i className="ri-arrow-right-s-line fs-21"></i>}
                onClick={() => handleOpenSubModal("postpone")}
                // invalid={validation.touched.account && validation.errors.account}
                // errorMessage={validation.errors.account}
              />
              <Button
                disabled={loading}
                // type={`${loading ? "Loading..." : "submit"} `}
                type="submit"
                className="primary-btn w-100 fs-16 mt-2"
              >
                {loading ? "Loading..." : "Confirm Payment"}
              </Button>
            </div>
          </Modal.Body>
        </Form>
      </Modal>

      {/* ================================================= */}
      {/*                       Modals                      */}
      {/* ================================================= */}

      <SelectAccountModal
        isOpen={currentSubModal == "selectAccount"}
        onClose={handleCloseSubModal}
        onSelectValue={addAccountFieldValue}
      />

      <CustomCalanderModal
        title="payment date"
        isOpen={currentSubModal == "paymentDate"}
        onClose={handleCloseSubModal}
        onSelectValue={handlePaymentDateValue}
        buttonContent={actionLoading ? "Loading..." : "Save"}
        loading={actionLoading}
        onClickButton={handleSavePostponeDate}
        maxDate={new Date()}
      />

      <CustomCalanderModal
        title="postpone"
        isOpen={currentSubModal == "postpone"}
        onClose={handleCloseSubModal}
        onSelectValue={handlePaymentDateValue}
        buttonContent={actionLoading ? "Loading..." : "Save"}
        loading={actionLoading}
        onClickButton={handleSavePostponeDate}
        minDate={new Date()}
      />

      <CommonDeleteModal
        isOpen={isDelete}
        onClose={handleCloseDeleteModal}
        backdropClassName={"backdrop-upper"}
        content={{
          title: "Delete Payemnt",
          description: "Are you sure you want to delete the Payment?",
        }}
        onConfirm={handleConfirm}
        loading={actionLoading || loading}
      />
    </>
  );
};

EditGeneralDetailsModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  editData: PropTypes.object,
  open: PropTypes.func,
  handleCloseDirectly: PropTypes.func,
  onSuccess: PropTypes.func,
  onPostpone: PropTypes.func,
  transactionType: PropTypes.string,
  title: PropTypes.string,
};

export default memo(EditGeneralDetailsModal);
