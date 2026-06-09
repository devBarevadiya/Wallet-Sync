import { Button, Form, Modal } from "react-bootstrap";
import ModelWrapper from "../../../ModelWrapper";
import * as yup from "yup";
import InputField from "../../../inputFields/InputField";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import { applyPromoCodeThunk } from "../../../../store/promoCode/thunk";
import { verifyTokenThunk } from "../../../../store/actions";
import { useSelector } from "react-redux";
import { useCallback } from "react";

const ApplyPromoCodeModal = ({ isOpen, onHide }) => {
  const dispatch = useDispatch();
  const { token } = useSelector((store) => store.Auth);
  const { loading } = useSelector((state) => state.PromoCode);

  const initialValues = {
    code: "",
  };

  const validationSchema = yup.object({
    code: yup.string().required("code is requried"),
  });

  const validation = useFormik({
    name: "applyPromoCode",
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const response = await dispatch(applyPromoCodeThunk(values));
      if (applyPromoCodeThunk.fulfilled.match(response)) {
        await dispatch(verifyTokenThunk({ token }));
        onHide();
      }
    },
  });

  const handleClose = useCallback(() => {
    validation.resetForm();
    onHide();
  }, [onHide]);

  return (
    <ModelWrapper
      show={isOpen}
      className="modal-650px"
      title={"Apply Promo Code"}
      onHide={handleClose}
    >
      <Modal.Body>
        <Form onSubmit={validation.handleSubmit}>
          <InputField
            name="code"
            id="code"
            label="promo code"
            placeholder="enter promo code"
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            value={validation.values.code}
            invalid={validation.touched.code && validation.errors.code}
            errorMessage={validation.errors.code}
          />
          <div className="d-flex gap-3 w-100">
            <Button className="light-gray-btn w-100" onClick={onHide}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="primary-btn w-100"
              onClick={validation.handleSubmit}
              disabled={loading}
            >
              {`${loading ? "Loading..." : "Submit"}`}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </ModelWrapper>
  );
};

export default ApplyPromoCodeModal;
