import { Button, Form, Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import InputField from "../../inputFields/InputField";
import SelectField from "../../inputFields/SelectField";
import IconsModal from "./IconsModal";
import { useState } from "react";
import * as yup from "yup";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { awsThunk } from "../../../store/actions";
import { useModalScroll } from "../../../helpers/customHooks";

const CategoryModal = ({ isOpen, onHide }) => {
  const [isModal, setIsModal] = useState(false);
  const [icon, setIcon] = useState("");
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const dispatch = useDispatch();
  const { data } = useSelector((store) => store.Aws);
  const [file, setFile] = useState();

  const initialValues = {
    title: "",
    type: "",
    icon: "",
  };

  const validationSchema = yup.object({
    title: yup.string().required("title is required"),
    type: yup.string().required("type is required"),
    icon: yup.string().required("icon is required"),
  });

  const validation = useFormik({
    name: "add-edit-category-modal",
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const response = await dispatch(awsThunk(file));
      // if (awsThunk.fulfilled.match(response)) {

      // }
    },
  });

  return (
    <div>
      <Modal
        show={isOpen}
        centered={true}
        onHide={onHide}
        className="modal-650px category-modal"
        backdropClassName="bg-transparent"
        animation={false}
      >
        <Modal.Header className="mb-3">
          <div className="d-flex align-items-center justify-content-between w-100">
            <Modal.Title className="text-capitalize fs-21 responsive">
              <i
                className="ri-arrow-left-line cursor-pointer fs-4 me-3"
                onClick={() => onHide()}
              ></i>
              Add Category
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body ref={modalBodyRef} className="pt-0 height-80vh">
          <Form onSubmit={validation.handleSubmit}>
            <ul className="m-0 p-0">
              <li className="mb-4">
                <div
                  className={`${
                    validation.touched.icon &&
                    validation.errors.icon &&
                    "border-color-invalid"
                  } form-control d-flex align-items-center cursor-pointer border br-10 px-3 w-100`}
                  onClick={() => setIsModal(true)}
                >
                  <span className="d-flex w-100 align-items-center justify-content-between">
                    <span className="d-flex align-items-center">
                      {validation.values.icon && (
                        <img
                          src={validation.values.icon}
                          className="me-2"
                          alt=""
                        />
                      )}
                      Edit Icon & Color{" "}
                    </span>
                    <span className="">
                      <i className="ri-arrow-right-s-line fs-18 fw-bold"></i>
                    </span>
                  </span>
                </div>
                {validation.touched.icon && validation.errors.icon && (
                  <span className="text-color-invalid fs-12 text-capitalize mt-1 d-block">
                    {validation.errors.icon}
                  </span>
                )}
              </li>
              <li className="">
                <InputField
                  label="name"
                  name="title"
                  id="title"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  invalid={validation.touched.title && validation.errors.title}
                  errorMessage={validation.errors.title}
                />
              </li>
              <li className="">
                <SelectField
                  label="nature"
                  name="type"
                  id="type"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  invalid={validation.touched.type && validation.errors.type}
                  errorMessage={validation.errors.type}
                >
                  <option value="">select nature</option>
                  <option value="NONE">none</option>
                  <option value="MUST">must</option>
                  <option value="NEED">need</option>
                  <option value="WANT">want</option>
                </SelectField>
              </li>
            </ul>
            <Button className="w-100 primary-btn" type="submit">
              Save
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <IconsModal
        isOpen={isModal}
        onHide={() => setIsModal(false)}
        callback={(e) => {
          validation.setFieldValue("icon", e.base64),
            setIsModal(false),
            setFile(e.file);
        }}
      />
    </div>
  );
};

CategoryModal.propTypes = {
  isOpen: PropTypes.bool,
  onHide: PropTypes.func,
};

export default CategoryModal;
