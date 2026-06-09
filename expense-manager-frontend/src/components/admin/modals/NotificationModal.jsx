import { Button, Form, Modal } from "react-bootstrap";
import ModelWrapper from "../../ModelWrapper";
import { memo, useCallback } from "react";
import * as yup from "yup";
import { useFormik } from "formik";
import InputField from "../../inputFields/InputField";
import TextAreaField from "../../inputFields/TextAreaField";
import { deviceTypeEnum } from "../../../helpers/enum";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { customNotificationThunk } from "../../../store/notification/thunk";
import { useModalScroll } from "../../../helpers/customHooks";

const NotificationModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.Notification);
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const data = [
    {
      icon: "ri-apple-fill",
      title: "IOS",
      value: deviceTypeEnum.IOS,
    },
    {
      icon: "ri-android-fill",
      title: "Android",
      value: deviceTypeEnum.ANDROID,
    },
    {
      icon: "ri-global-fill",
      title: "Web",
      value: deviceTypeEnum.WEB,
    },
  ];

  const initialValues = {
    title: "",
    description: "",
    deviceTypes: [],
  };

  const validationSchema = yup.object({
    title: yup.string().required("title is required"),
    description: yup.string().required("description is required"),
    deviceTypes: yup
      .array()
      .min(1, "min 1 device required")
      .required("device type is requried"),
  });

  const validation = useFormik({
    name: "notificationValidation",
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const response = await dispatch(customNotificationThunk(values));
      if (customNotificationThunk.fulfilled.match(response)) {
        onClose();
        resetForm();
      }
    },
  });

  const handleClose = useCallback(() => {
    onClose(), validation.resetForm();
  }, [onClose, validation.resetForm]);

  const handleDeviceTypeToggle = useCallback(
    (value) => {
      const devicetype = validation.values.deviceTypes;
      if (devicetype?.includes(value)) {
        const updateDeviceType = devicetype?.filter(
          (device) => device !== value
        );
        validation.setFieldValue("deviceTypes", updateDeviceType);
      } else {
        validation.setFieldValue("deviceTypes", [...devicetype, value]);
      }
    },
    [validation.values.deviceTypes]
  );

  return (
    <ModelWrapper
      show={isOpen}
      onHide={handleClose}
      title="Create Notification"
      className="modal-650px responsive"
    >
      <Modal.Body ref={modalBodyRef}>
        <Form onSubmit={validation.handleSubmit}>
          <InputField
            name="title"
            id="title"
            label="notification title"
            placeholder="enter notification title"
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            value={validation.values.title}
            invalid={validation.touched.title && validation.errors.title}
            errorMessage={validation.errors.title}
          />
          <TextAreaField
            label="description"
            placeholder="Enter your description..."
            name="description"
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            value={validation.values.description}
            invalid={
              validation.touched.description && validation.errors.description
            }
            errorMessage={validation.errors.description}
          />
          <div className="mt-4">
            <Form.Label className="text-capitalize fs-16">Device: </Form.Label>
            <ul className="p-0 m-0 d-flex align-items-center gap-3">
              {data?.map((item, index) => (
                <li
                  key={index}
                  className="d-flex align-items-center gap-2 border br-10 px-3 py-2 cursor-pointer"
                  onClick={() => {
                    handleDeviceTypeToggle(item?.value);
                  }}
                >
                  <Form.Check
                    className={`square-check mb-1 text-color-light-gray  fs-14 cursor-pointer user-select-none me-1`}
                    type={"checkbox"}
                    id={`allow-account`}
                    // label={`Select Accounts`}
                    checked={validation.values.deviceTypes?.includes(
                      item?.value
                    )}
                  />
                  <span>
                    <i className={`${item?.icon} fs-24 me-1`}></i>
                    <span>{item?.title}</span>
                  </span>
                </li>
              ))}
            </ul>
            {validation.touched.deviceTypes &&
              validation.errors.deviceTypes && (
                <span className="text-color-invalid fs-12 text-capitalize mt-1 d-block">
                  {validation.errors.deviceTypes}
                </span>
              )}
          </div>
          <div className="d-flex gap-3 w-100 mt-4">
            <Button onClick={handleClose} className="light-gray-btn w-100">
              Cacel
            </Button>
            <Button type="submit" className="primary-btn w-100">
              Submit
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </ModelWrapper>
  );
};

NotificationModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export default memo(NotificationModal);
