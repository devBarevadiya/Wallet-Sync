import { useState } from "react";
import ModelWrapper from "../../ModelWrapper";
import { Button, Form, Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as yup from "yup";
import InputField from "../../inputFields/InputField";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { awsThunk, updateUserDetailsThunk } from "../../../store/actions";
import { Image } from "../../../data/images";

const ProfileModal = ({ show, onHide }) => {
  const [base64Img, setBase64Img] = useState("");
  const [iconFile, setIconFile] = useState(null);
  const { loading, user } = useSelector((store) => store.Auth);
  const { uploadLoading } = useSelector((store) => store.Aws);
  const dispatch = useDispatch();

  const initialValues = {
    avatar: user?.avatar || "",
    username: user?.username || "",
  };

  const validationSchema = yup.object({
    avatar: yup.string(),
    username: yup.string().required(),
  });

  const validation = useFormik({
    name: "profileValidation",
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      const onSuccess = async (img = "") => {
        const response = await dispatch(
          updateUserDetailsThunk({
            values: { ...values, avatar: img },
            id: user?._id,
          })
        );
        if (updateUserDetailsThunk.fulfilled.match(response)) {
          handleCloseModal();
        }
      };

      if (base64Img) {
        const formData = new FormData();
        formData.append("file", iconFile);
        formData.append("dirName", "avatar");
        const imgResponse = await dispatch(awsThunk(formData));
        if (awsThunk.fulfilled.match(imgResponse)) {
          onSuccess(imgResponse.payload.data);
          return;
        }
      } else {
        onSuccess(user?.avatar);
      }
    },
  });

  const handleAvatarImg = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        validation.setFieldValue("avatar", reader.result);
        setBase64Img(reader.result);
      };
    }
  };

  const handleCloseModal = () => {
    onHide();
    setIconFile("");
    setBase64Img("");
    validation.resetForm();
  };

  return (
    <ModelWrapper
      show={show}
      onHide={handleCloseModal}
      title={"edit profile"}
      className="modal-650px"
    >
      <Form onSubmit={validation.handleSubmit}>
        <Modal.Body className="p-4">
          <label
            htmlFor="avatar-img"
            className="d-block w-90px h-90px mx-auto position-relative cursor-pointer"
          >
            <img
              className="object-fit-cover rounded-circle mx-auto w-100 h-100 d-block"
              src={
                !base64Img
                  ? user?.avatar
                    ? import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                      user?.avatar
                    : Image.defaultUserImg
                  : base64Img
              }
              alt=""
            />
            <span className="w-30px d-flex text-white align-items-center justify-content-center h-30px bg-color-primary position-absolute bottom-0 end-0 border border-2 border-white rounded-circle">
              <i className="ri-edit-line fs-16"></i>
            </span>
          </label>
          <input
            accept=".png,.jpg,.jpeg,.webp"
            id="avatar-img"
            type="file"
            onChange={handleAvatarImg}
            className="d-none"
          />
          <span className="text-center d-block fw-semibold mt-1 mb-3 text-break text-wrap truncate-line-1 mx-3 mx-sm-5">
            {user?.email}
          </span>
          <InputField
            name="username"
            id="username"
            label="username"
            placeholder="enter username"
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            value={validation.values.username}
            invalid={validation.touched.username && validation.errors.username}
            errorMessage={validation.errors.username}
          />
          <div className="d-flex gap-3 w-100">
            <Button className="light-gray-btn w-100" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="primary-btn w-100"
              // onClick={validation.handleSubmit}
              disabled={loading || uploadLoading}
            >
              {`${loading || uploadLoading ? "Loading..." : "Submit"}`}
            </Button>
          </div>
        </Modal.Body>
      </Form>
    </ModelWrapper>
  );
};

ProfileModal.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
};

export default ProfileModal;
