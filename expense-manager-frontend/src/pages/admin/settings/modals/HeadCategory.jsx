import { useEffect, useState } from "react";
import ModelWrapper from "./ModalWrapper";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import * as yup from "yup";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import {
  awsThunk,
  createHeadThunk,
  getCategoryThunk,
  updateHeadThunk,
} from "../../../../store/actions";
import SelectField from "../../../../components/inputFields/SelectField";
import {
  categoryTypeEnum,
  transactionTypeEnum,
} from "../../../../helpers/enum";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import IconsModal from "../../../../components/admin/modals/IconsModal";
import { setDocumentTitle } from "../../../../store/filters/slice";
import { useModalScroll } from "../../../../helpers/customHooks";

const HeadCategory = ({ isOpen, onHide, title, data = {} }) => {
  const isEdit = Object.keys(data)?.length ? true : false;
  const dispatch = useDispatch();
  const { loading } = useSelector((store) => store.Category);
  const { uploadLoading: awsLoading } = useSelector((store) => store.Aws);
  const [imageData, setImageData] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isIconModal, setIsIconModal] = useState(false);
  const image = data.icon
    ? import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL + data.icon
    : "";

  const awsHandler = async (file, dirName = "category") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dirName", dirName);
    return await dispatch(awsThunk(formData));
  };

  const initialValues = {
    title: data.title || "",
    type: data.type || transactionTypeEnum.EXPENSE,
    icon: data.icon || "",
  };

  const validationSchema = yup.object({
    title: yup.string().required("title is required"),
    type: yup.string().required("type is required"),
    icon: yup.string().required("icon is required"),
  });

  const validation = useFormik({
    name: "add-edit-head-category",
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      // updateHeadHandler for handle edit head category
      const updateHeadHandler = async (values) => {
        // delete values.type
        const response = await dispatch(
          updateHeadThunk({
            id: data?._id,
            values,
          })
        );
        if (updateHeadThunk.fulfilled.match(response)) {
          dispatch(
            setDocumentTitle(
              values.title +
                " - Wallet Sync - Budget Planner and Expense Tracker"
            )
          );
          setImageData();
          setImageFile();
          onHide();
        }
        return response;
      };

      if (isEdit) {
        if (imageFile) {
          const awsImg = await awsHandler(imageFile);
          if (awsThunk.fulfilled.match(awsImg)) {
            await updateHeadHandler({
              ...values,
              icon: awsImg.payload.data,
            });
          }
          return;
        }
        delete values.icon;
        await updateHeadHandler(values);
      } else {
        const awsResponse = await awsHandler(imageFile);
        if (awsThunk.fulfilled.match(awsResponse)) {
          const response = await dispatch(
            createHeadThunk({ ...values, icon: awsResponse.payload.data })
          );
          if (createHeadThunk.fulfilled.match(response)) {
            resetForm();
            setImageData("");
            setImageFile();
            onHide();
            dispatch(getCategoryThunk());
          }
        }
      }
    },
  });

  const handleFilePreview = (input) => {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      validation.setFieldValue("icon", file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageData(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloseModal = () => {
    setIsIconModal(false);
    validation.resetForm();
  };

  const handleSetIconData = (e) => {
    validation.setFieldValue("icon", e.base64);
    setImageData(e.base64);
    setImageFile(e.file);
    setIsIconModal(false);
  };

  useEffect(() => {
    if (isEdit) {
      setImageData(image);
      validation.setFieldValue("icon", image);
    }
  }, [data]);

  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  return (
    <>
      <ModelWrapper
        show={isOpen}
        onHide={() => {
          setImageData(), onHide(), validation.resetForm();
        }}
        title={title || isEdit ? "edit head category" : "add head category"}
      >
        <Modal.Body ref={modalBodyRef} className="p-4">
          <Form onSubmit={validation.handleSubmit}>
            <div className={`d-flex align-items-center gap-3`}>
              <div className={`min-w-50px w-50px aspect-square br-10`}>
                <div className="mx-auto">
                  {/* <Form.Control
                    type="file"
                    hidden
                    name="icon"
                    onChange={(e) => {
                      handleFilePreview(e.target);
                    }}
                    id="uploadFile"
                    accept="image/png, image/jpg, image/jpeg, image/webp"
                  />
                  <label
                    htmlFor="uploadFile"
                    className={`cursor-pointer d-flex align-items-center justify-content-center h-100 aspect-square br-10 overflow-hidden border ${
                      validation.touched.icon && validation.errors.icon
                        ? "border-color-invalid"
                        : "common-border-color"
                    }`}
                  >
                    {validation.values.icon ? (
                      <img
                        className="w-100 h-100 object-fit-cover cursor-pointer"
                        src={imageData}
                        alt="user-image"
                      />
                    ) : (
                      <label className={`cursor-pointer`} htmlFor="uploadFile">
                        <i className="ri-add-fill fs-24 text-color-primary fw-semibold"></i>
                      </label>
                    )}
                  </label> */}
                  <span
                    onClick={() => setIsIconModal(true)}
                    className={`cursor-pointer d-flex align-items-center justify-content-center h-100 aspect-square br-10 overflow-hidden border ${
                      validation.touched.icon && validation.errors.icon
                        ? "border-color-invalid"
                        : "common-border-color"
                    }`}
                  >
                    {imageData ? (
                      <img
                        className="w-100 h-100 object-fit-cover cursor-pointer"
                        src={imageData}
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
                  placeholder="enter head category"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.title}
                />
              </div>
            </div>
            <div className={`mt-18px`}>
              <SelectField
                className="mb-0"
                name="type"
                id="type"
                label=""
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                value={validation.values.type}
                invalid={validation.touched.type && validation.errors.type}
                errorMessage={validation.errors.type}
              >
                {Object.keys(categoryTypeEnum)?.map((item, key) => {
                  return (
                    <option key={key} value={item}>
                      {categoryTypeEnum[item]}
                    </option>
                  );
                })}
              </SelectField>
            </div>
            <Row className={`mt-4 px-1`}>
              <Col className={`px-2`}>
                <Button
                  className="light-gray-btn w-100 fs-16 responsive"
                  onClick={() => {
                    onHide(), validation.resetForm(), setImageData();
                  }}
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
                  className="w-100 text-truncate primary-btn  py-1 br-15 d-flex align-items-center justify-content-center px-3 text-capitalize fs-16 responsive"
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
      <IconsModal
        isOpen={isIconModal}
        onHide={handleCloseModal}
        callback={handleSetIconData}
      />
    </>
  );
};

HeadCategory.propTypes = {
  isOpen: PropTypes.bool,
  onHide: PropTypes.func,
  title: PropTypes.any,
  data: PropTypes.object,
};

export default HeadCategory;
