import { Button, Form, Modal } from "react-bootstrap";
import ModelWrapper from "../../../pages/admin/settings/modals/ModalWrapper";
import PropTypes from "prop-types";
import InputField from "../../inputFields/InputField";
import * as yup from "yup";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import {
  createPayeeThunk,
  getAllPayeeThunk,
  updatePayeeThunk,
} from "../../../store/actions";
import PhoneInput from "react-phone-input-2";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useModalScroll } from "../../../helpers/customHooks";

const PayeeModal = ({
  show,
  size,
  centered,
  onHide,
  item = {},
  isLoading = false,
}) => {
  const isEdit = Object.keys(item)?.length ? true : false;
  const dispatch = useDispatch();
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const initialValues = {
    name: item?.name || "",
    email: item?.email || "",
    mobile: item?.mobile ? "+" + item?.mobile : "",
    business: item?.business || "",
  };

  const validationSchema = yup.object({
    name: yup.string().required("name is required"),
    email: yup.string().email("Invalid email"),
    mobile: yup
      .string()
      // .required("Phone number is required")
      .test("isValidPhone", "Invalid phone number", (value) =>
        value ? isValidPhoneNumber(value) : true
      ),
    business: yup.string(),
  });

  const validation = useFormik({
    name: "payee validation",
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      if (!isEdit) {
        const filterValue = Object.fromEntries(
          Object.entries(values)?.filter(
            ([, value]) => value !== undefined && value !== null && value !== ""
          )
        );

        const response = await dispatch(
          createPayeeThunk({ values: filterValue })
        );
        if (createPayeeThunk.fulfilled.match(response)) {
          dispatch(getAllPayeeThunk());
          resetForm();
          onHide();
        }
      } else {
        const filterValue = Object.fromEntries(
          Object.entries(values)?.map(([key, value]) => [
            key,
            value == "" ? null : value,
          ])
        );

        const response = await dispatch(
          updatePayeeThunk({ id: item?._id, values: filterValue })
        );
        if (updatePayeeThunk.fulfilled.match(response)) {
          dispatch(getAllPayeeThunk());
          resetForm();
          onHide();
        }
      }
    },
  });

  const handleCloseModal = () => {
    onHide();
    validation.resetForm();
  };

  return (
    <ModelWrapper
      show={show}
      size={size}
      centered={centered}
      onHide={handleCloseModal}
      title={`${isEdit ? "Edit Payee" : "Add Payee"}`}
    >
      <Form onSubmit={validation.handleSubmit}>
        <Modal.Body ref={modalBodyRef} className="">
          <InputField
            name="name"
            id="name"
            label="name"
            placeholder="enter name"
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            value={validation.values.name}
            invalid={validation.touched.name && validation.errors.name}
            errorMessage={validation.errors.name}
          />
          <InputField
            optional
            name="email"
            id="email"
            label="email"
            type="email"
            placeholder="enter email"
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            value={validation.values.email}
            invalid={validation.touched.email && validation.errors.email}
            errorMessage={validation.errors.email}
          />
          {/* <InputField
            optional
            name="mobile"
            id="mobile"
            label="mobile"
            type="text"
            placeholder="enter mobile no."
            onChange={(e) => {
              if (/^\d*$/.test(e.target.value)) {
                validation.handleChange(e);
              }
              validation.handleChange;
            }}
            onBlur={validation.handleBlur}
            value={validation.values.mobile}
            invalid={validation.touched.mobile && validation.errors.mobile}
            errorMessage={validation.errors.mobile}
          /> */}
          <span className="mb-4 d-block child-focus-none">
            <Form.Label className="text-capitalize fs-16">
              Mobile
              <span className="fs-12 ms-2 text-color-monsoon">(optional)</span>
            </Form.Label>
            <PhoneInput
              disableAreaCodes={true}
              inputStyle={{
                outline: "none",
                boxShadow: "none",
                border: `1px solid ${
                  validation.touched.mobile && validation.errors.mobile
                    ? "#f06548"
                    : "#ebebeb"
                }`,
              }}
              // country={"in"}
              inputProps={{
                name: "mobile",
                id: "mobile",
                // required: true,
              }}
              value={"+" + validation.values.mobile}
              onChange={(phone) =>
                validation.setFieldValue("mobile", "+" + phone)
              }
              onBlur={() =>
                validation.handleBlur({ target: { name: "mobile" } })
              }
            />
            {validation.touched.mobile && validation.errors.mobile && (
              <span className="text-color-invalid fs-12 text-capitalize mt-1 d-block">
                {validation.errors.mobile}
              </span>
            )}
          </span>
          <InputField
            optional
            name="business"
            id="business"
            label="business"
            placeholder="enter business name"
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            value={validation.values.business}
            invalid={validation.touched.business && validation.errors.business}
            errorMessage={validation.errors.business}
          />
          <div className="d-flex gap-3 w-100">
            <Button className="light-gray-btn w-100" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="primary-btn w-100"
              // onClick={validation.handleSubmit}
              disabled={isLoading}
            >
              {`${isLoading ? "Loading..." : "Submit"}`}
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </ModelWrapper>
  );
};

PayeeModal.propTypes = {
  size: PropTypes.string,
  centered: PropTypes.bool,
  show: PropTypes.any,
  onHide: PropTypes.any,
  item: PropTypes.object,
  isLoading: PropTypes.bool,
};

export default PayeeModal;
