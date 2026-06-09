import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import ModelWrapper from "../../../ModelWrapper";
import InputField from "../../../inputFields/InputField";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import {
  generatePromoCodeThunk,
  getPromoCodeThunk,
} from "../../../../store/promoCode/thunk";
import { useCallback } from "react";
import { useFormik } from "formik";
import { formatDate } from "../../../../helpers/commonFunctions";
import { useSelector } from "react-redux";

const GeneratePromoCodeModal = ({ isOpen, onHide }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.PromoCode);

  const initialValues = {
    count: 0,
    validFrom: "",
    validUntil: "",
    tag: "",
    trialDays: 0,
  };

  const validationSchema = yup.object({
    count: yup
      .number()
      .min(1, "min 1 count required")
      .required("count is requried"),
    validFrom: yup.string().required("valid from is requried"),
    validUntil: yup.string().required("valid until is requried"),
    tag: yup.string().required("tag is requried"),
    trialDays: yup
      .number()
      .test(
        "valid-trial-days",
        "min 1 count required",
        (value) => value > 0 || value == -1
      )
      .required("trial days is requried"),
  });

  const validation = useFormik({
    name: "applyPromoCode",
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const updatedValue = {
        ...values,
        validFrom: formatDate(values.validFrom, "yyyy-MM-DD"),
        validUntil: formatDate(values.validUntil, "yyyy-MM-DD"),
      };
      const response = await dispatch(generatePromoCodeThunk(updatedValue));
      if (generatePromoCodeThunk.fulfilled.match(response)) {
        resetForm();
        await dispatch(getPromoCodeThunk());
        // generatePDF(response.payload.data);
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
      onHide={handleClose}
      className="modal-650px"
      title={"Generate Promo Code"}
    >
      <Modal.Body>
        <Form onSubmit={validation.handleSubmit}>
          <InputField
            name="tag"
            id="tag"
            label="tag"
            placeholder="Enter Tag"
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            value={validation.values.tag}
            invalid={validation.touched.tag && validation.errors.tag}
            errorMessage={validation.errors.tag}
          />
          <InputField
            name="count"
            id="count"
            type="number"
            label="code count"
            placeholder="0"
            inputMode="numeric"
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            value={validation.values.count > 0 ? validation.values.count : ""}
            invalid={validation.touched.count && validation.errors.count}
            errorMessage={validation.errors.count}
          />
          <Row>
            <Col sm={12} md={6}>
              <InputField
                fieldClass="d-flex align-items-center"
                name="validFrom"
                id="validFrom"
                label="valid From"
                type="date"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.validFrom}
                invalid={
                  validation.touched.validFrom && validation.errors.validFrom
                }
                errorMessage={validation.errors.validFrom}
              />
            </Col>
            <Col sm={12} md={6}>
              <InputField
                fieldClass="d-flex align-items-center"
                name="validUntil"
                id="validUntil"
                label="valid Until"
                type="date"
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.validUntil}
                invalid={
                  validation.touched.validUntil && validation.errors.validUntil
                }
                errorMessage={validation.errors.validUntil}
              />
            </Col>
          </Row>
          <div className="d-flex align-items-center gap-4 mb-4">
            <span
              className="d-flex align-items-center gap-2 cursor-pointer custom-radio"
              onClick={() => validation.setFieldValue("trialDays", 0)}
            >
              {/* <Form.Check
                checked={validation.values.trialDays >= 0}
                type="radio"
              />
              <span className="user-select-none">Trial in days</span> */}

              <input
                checked={validation.values.trialDays >= 0}
                type="radio"
                id="days"
                name="gender"
              />
              <label htmlFor="days" className="">
                Trial in days
              </label>
            </span>
            <span
              className="d-flex align-items-center gap-2 cursor-pointer custom-radio"
              onClick={() => validation.setFieldValue("trialDays", -1)}
            >
              {/* <input type="radio" id="male" name="gender" />
              <label htmlFor="male">Male</label> */}

              {/* <Form.Check
                checked={validation.values.trialDays == -1}
                type="radio"
                id="lifetime"
              /> */}
              <input
                checked={validation.values.trialDays == -1}
                type="radio"
                id="lifetime"
                name="gender"
              />
              <label htmlFor="lifetime" className="">
                lifetime
              </label>
              {/* <span className="user-select-none">Lifetime</span> */}
            </span>
          </div>
          {validation.values.trialDays >= 0 && (
            <InputField
              name="trialDays"
              id="trialDays"
              label="trial Days"
              placeholder="0"
              inputMode="numeric"
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={
                validation.values.trialDays > 0
                  ? validation.values.trialDays
                  : ""
              }
              invalid={
                validation.touched.trialDays && validation.errors.trialDays
              }
              errorMessage={validation.errors.trialDays}
            />
          )}
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

export default GeneratePromoCodeModal;
