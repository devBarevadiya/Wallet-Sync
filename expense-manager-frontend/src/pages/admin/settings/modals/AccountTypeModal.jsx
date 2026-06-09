import { useState } from "react";
import ModelWrapper from "./ModalWrapper";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import * as yup from "yup";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import {
  awsThunk,
  getAccountTypeThunk,
  postAccountTypeThunk,
  updateAccountTypeThunk,
} from "../../../../store/actions";
import OnlyIconsModal from "../../../../components/admin/modals/OnlyIconsModal";
import { setEditData } from "../../../../store/accountType/slice";
import IconsModal from "../../../../components/admin/modals/IconsModal";

const AccountTypeModal = ({ isOpen, onHide, title }) => {
  const dispatch = useDispatch();
  const { loading, editData } = useSelector((store) => store.AccountType);
  const { uploadLoading: awsLoading } = useSelector((store) => store.Aws);
  const [imageFile, setImageFile] = useState(null);
  const [isIconModal, setIsIconModal] = useState(false);

  const awsHandler = async (file, dirName = "account type") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dirName", dirName);
    return await dispatch(awsThunk(formData));
  };

  const toggle = () => {
    dispatch(setEditData({}));
    validation.resetForm();
    onHide();
  };

  const initialValues = {
    title: editData.title || "",
    icon: editData.icon
      ? import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL + editData.icon
      : "",
  };

  const validationSchema = yup.object({
    title: yup.string().required("title is required"),
    icon: yup.string().required("icon is required"),
  });

  const validation = useFormik({
    name: "add-edit-account-type",
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      delete values.color;
      const updateHandler = async (values) => {
        const response = await dispatch(
          updateAccountTypeThunk({
            id: editData._id,
            values,
          })
        );
        if (updateAccountTypeThunk.fulfilled.match(response)) {
          toggle();
          setImageFile();
          dispatch(getAccountTypeThunk());
        }
        return response;
      };
      if (editData._id) {
        if (imageFile) {
          const awsImg = await awsHandler(imageFile);
          if (awsThunk.fulfilled.match(awsImg)) {
            await updateHandler({
              ...values,
              icon: awsImg.payload.data,
            });
          }
          return;
        }
        delete values.icon;
        await updateHandler(values);
      } else {
        const awsImg = await awsHandler(imageFile);
        if (awsThunk.fulfilled.match(awsImg)) {
          const response = await dispatch(
            postAccountTypeThunk({ ...values, icon: awsImg.payload.data })
          );
          if (postAccountTypeThunk.fulfilled.match(response)) {
            toggle();
            setImageFile();
            dispatch(getAccountTypeThunk());
          }
        }
      }
    },
  });

  const handleCloseModal = () => {
    setIsIconModal(false);
    // validation.resetForm();
  };

  const handleSetIconData = (e) => {
    validation.setFieldValue("icon", e.base64);
    setImageFile(e.file);
    setIsIconModal(false);
  };

  return (
    <>
      <ModelWrapper
        show={isOpen}
        onHide={() => {
          setImageFile(), toggle();
        }}
        title={title || editData._id ? "edit account type" : "add account type"}
      >
        <Modal.Body className="p-4">
          <Form onSubmit={validation.handleSubmit}>
            <div className={`d-flex align-items-center gap-3`}>
              <div className={`min-w-50px w-50px aspect-square br-10`}>
                <div className="mx-auto">
                  <span
                    onClick={() => setIsIconModal(true)}
                    className={`cursor-pointer d-flex align-items-center justify-content-center h-100 aspect-square br-10 overflow-hidden border ${
                      validation.touched.icon && validation.errors.icon
                        ? "border-color-invalid"
                        : "common-border-color"
                    }`}
                  >
                    {validation.values.icon ? (
                      <img
                        className="w-100 aspect-square object-fit-cover cursor-pointer"
                        src={validation.values.icon}
                        alt="user-image"
                      />
                    ) : (
                      <i className="ri-add-fill fs-24 text-color-primary fw-semibold"></i>
                    )}
                  </span>
                </div>
              </div>
              <div className={`w-100`}>
                <Form.Control
                  // className={`${
                  //   invalid ? "border border-color-invalid" : "common-border-color"
                  // } text-color-dusty-gray pe-5 fs-16 responsive`}
                  className={`h-100 ${
                    validation.touched.title && validation.errors.title
                      ? "border-color-invalid"
                      : "common-border-color"
                  } text-color-dusty-gray fs-16 responsive`}
                  type={"text"}
                  name="title"
                  id="title"
                  placeholder="enter title"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.title}
                />
              </div>
            </div>
            <Row className={`mt-4 px-1`}>
              <Col className={`px-2`}>
                <Button
                  className="light-gray-btn w-100 fs-16 responsive"
                  onClick={onHide}
                >
                  Cancel
                </Button>
                {/* <Button
                className="w-100 text-truncate primary-white-btn focus-bg-color-primary v-fit min-h-45px py-1 br-8 bg-white hover-bg-color-primary hover-text-color-white-i hover-text-color-white-span text-dark-primary d-flex align-items-center justify-content-center border common-border-color px-3 gap-1 text-capitalize fs-6"
                onClick={onHide}
              >
                <span className={`text-dark-primary fw-normal lh-base`}>
                  cancel
                </span>
              </Button> */}
              </Col>
              <Col className={`px-2`}>
                <Button
                  disabled={loading || awsLoading}
                  type="submit"
                  className="w-100 text-truncate primary-btn py-1 br-15 d-flex align-items-center justify-content-center px-3 text-capitalize fs-16 responsive"
                >
                  <span className={`fw-normal lh-base`}>
                    {loading || awsLoading ? "saving..." : "save"}
                  </span>
                </Button>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
      </ModelWrapper>
      {/* <OnlyIconsModal
        isOpen={isIconModal}
        onHide={handleCloseModal}
        callback={handleSetIconData}
      /> */}
      <IconsModal
        isOpen={isIconModal}
        onHide={handleCloseModal}
        callback={handleSetIconData}
        paddingPercent={27}
      />
    </>
  );
};

AccountTypeModal.propTypes = {
  isOpen: PropTypes.bool,
  onHide: PropTypes.func,
  title: PropTypes.any,
};

export default AccountTypeModal;
