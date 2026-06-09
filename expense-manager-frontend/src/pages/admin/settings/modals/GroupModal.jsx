import { Button, Form, Modal } from "react-bootstrap";
import ModelWrapper from "../../../../components/ModelWrapper";
import InputField from "../../../../components/inputFields/InputField";
import * as yup from "yup";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import {
  createGroupThunk,
  getAllGroupsThunk,
  updateGroupThunk,
} from "../../../../store/group/thunk";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { useState } from "react";
import { awsThunk } from "../../../../store/actions";
import { useModalScroll } from "../../../../helpers/customHooks";

const GroupModal = ({ isOpen, onHide, data = {}, id }) => {
  const { actionLoading } = useSelector((store) => store.Group);
  const { uploadLoading: awsLoading } = useSelector((store) => store.Aws);
  const [base64Img, setBase64Img] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const dispatch = useDispatch();
  const isEdit = Object.keys(data)?.length ? true : false;

  const initialValues = {
    title: data?.title || "",
    icon: data?.icon || "",
  };

  const validationSchema = yup.object({
    title: yup.string().required("Title is required"),
  });

  const validation = useFormik({
    name: "groupValidation",
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const uploadFile = async (onSuccess) => {
        if (base64Img) {
          const formData = new FormData();
          formData.append("file", iconFile);
          formData.append("dirName", values.title);
          const imgResponse = await dispatch(awsThunk(formData));
          if (awsThunk.fulfilled.match(imgResponse)) {
            await onSuccess(imgResponse.payload.data);
            return;
          }
        }
        onSuccess();
      };

      if (isEdit) {
        uploadFile(async (imgResponse) => {
          const response = await dispatch(
            updateGroupThunk({ id, values: { ...values, icon: imgResponse } })
          );
          if (updateGroupThunk.fulfilled.match(response)) {
            onHide();
          }
        });
      } else {
        uploadFile(async (imgResponse) => {
          const response = await dispatch(
            createGroupThunk({ ...values, icon: imgResponse })
          );
          if (createGroupThunk.fulfilled.match(response)) {
            await dispatch(getAllGroupsThunk());
            onHide();
          }
        });
      }
    },
  });

  const handleGroupIcon = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        validation.setFieldValue("icon", reader.result);
        setBase64Img(reader.result);
      };
    }
  };

  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  return (
    <ModelWrapper
      show={isOpen}
      onHide={onHide}
      title={`${isEdit ? "edit group" : "create group"}`}
      className="modal-650px"
    >
      <Form onSubmit={validation.handleSubmit}>
        <Modal.Body ref={modalBodyRef} className="">
          <div className="d-flex align-items-center mb-3 gap-3">
            <div className={`min-w-50px w-50px aspect-square br-10`}>
              <div className="mx-auto">
                <span
                  // onClick={() => setIsIconModal(true)}
                  className={`cursor-pointer d-flex align-items-center justify-content-center h-100 aspect-square br-10 overflow-hidden border ${
                    validation.touched.icon && validation.errors.icon
                      ? "border-color-invalid"
                      : "common-border-color"
                  }`}
                >
                  <label htmlFor="group-img" className="cursor-pointer">
                    {data?.icon || base64Img ? (
                      <img
                        className="w-100 aspect-square object-fit-cover cursor-pointer"
                        src={
                          !base64Img
                            ? import.meta.env
                                .VITE_DIGITAL_OCEAN_SPACES_BASE_URL + data?.icon
                            : base64Img
                        }
                        alt="user-image"
                      />
                    ) : (
                      <i className="ri-add-fill fs-24 text-color-primary fw-semibold"></i>
                    )}
                  </label>
                  <input
                    accept="image/png, image/jpg, image/jpeg, image/webp"
                    id="group-img"
                    type="file"
                    onChange={handleGroupIcon}
                    className="d-none"
                  />
                </span>
              </div>
            </div>
            <InputField
              className="w-100"
              isLable={false}
              name="title"
              id="title"
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.title}
              invalid={validation.errors.title && validation.touched.title}
              errorMessage={validation.errors.title}
              label="Group Name"
              placeholder="Enter Group Name"
            />
          </div>
          <div className="d-flex gap-3 w-100">
            <Button
              className="light-gray-btn w-100 fs-16 responsive"
              onClick={() => onHide()}
            >
              Cancel
            </Button>
            <Button
              disabled={awsLoading || actionLoading}
              type="submit"
              className="primary-btn w-100 fs-16 responsive"
            >
              {awsLoading || actionLoading ? "Loading..." : "Save"}
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </ModelWrapper>
  );
};

GroupModal.propTypes = {
  isOpen: PropTypes.bool,
  onHide: PropTypes.func,
  data: PropTypes.object,
  id: PropTypes.string,
};

export default GroupModal;
