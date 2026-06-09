import { Button, Form, Modal } from "react-bootstrap";
import ModelWrapper from "../../ModelWrapper";
import * as yup from "yup";
import { useMemo, useState } from "react";
import { useFormik } from "formik";
import {
  awsThunk,
  createCategoryThunk,
  updateCategoryThunk,
} from "../../../store/actions";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import InputField from "../../inputFields/InputField";
import SelectField from "../../inputFields/SelectField";
import IconsModal from "./IconsModal";
import { useModalScroll } from "../../../helpers/customHooks";

const AddEditSubCategory = ({
  isOpen,
  onHide,
  filterKey,
  close,
  open,
  onSuccess,
}) => {
  const { selectedCategory, loading, selectedSubCategory } = useSelector(
    (store) => store.Category
  );
  const [subCategory, setIsSubCategory] = useState({
    data: {},
    isOpen: false,
  });
  const { uploadLoading: awsLoading } = useSelector((store) => store.Aws);
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });
  const [subCategoryIconModal, setSubCategoryIconModal] = useState({
    isOpen: false,
    file: "",
  });

  const isEdit = useMemo(
    () => Object?.keys(selectedSubCategory)?.length > 0,
    [selectedSubCategory]
  );

  const dispatch = useDispatch();

  const awsHandler = async (file, dirName = "category") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dirName", dirName);
    return await dispatch(awsThunk(formData));
  };

  const subCategoryIcon =
    selectedSubCategory?.icon &&
    import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
      selectedSubCategory?.icon;

  const subInitialValues = {
    title: selectedSubCategory?.title || "",
    icon: subCategoryIcon || "",
    color: selectedSubCategory?.color || "",
    iconType: selectedSubCategory?.iconType || "ICON",
    nature: selectedSubCategory?.nature || "NONE",
  };

  const subValidationSchema = yup.object({
    title: yup.string().required("title is required"),
    icon: yup.string().required("icon is required"),
    color: yup.string().required("color is required"),
    iconType: yup.string().required("color is required"),
    nature: yup.string().required("color is required"),
  });

  const subValidation = useFormik({
    name: "sub-category-validation",
    initialValues: subInitialValues,
    enableReinitialize: true,
    validationSchema: subValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      const updateHandler = async (values) => {
        const response = await dispatch(
          updateCategoryThunk({
            id: selectedSubCategory?._id,
            headId: selectedCategory._id,
            values,
          })
        );
        if (updateCategoryThunk.fulfilled.match(response)) {
          // onHide();
          onSuccess();
          resetForm();
          setIsSubCategory({ data: {}, isOpen: false });
        }
        return response;
      };
      const isEdit = Object.keys(selectedSubCategory)?.length ? true : false;

      // if (subCategory?.title !== values.title) {
      //   delete values.title;
      // }

      if (isEdit) {
        if (subCategoryIconModal.file) {
          const awsImg = await awsHandler(subCategoryIconModal.file);
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
        return;
      }
      const awsImg = await awsHandler(subCategoryIconModal.file);
      if (awsThunk.fulfilled.match(awsImg)) {
        const response = await dispatch(
          createCategoryThunk({
            id: selectedCategory._id,
            values: { ...values, icon: awsImg.payload.data },
          })
        );
        if (createCategoryThunk.fulfilled.match(response)) {
          setIsSubCategory((pre) => ({ ...pre, isOpen: false }));
          // onHide();
          onSuccess()
          resetForm();
          setSubCategoryIconModal({});
        }
      }
    },
  });

  return (
    <>
      <ModelWrapper
        show={isOpen}
        onHide={onHide}
        title={`${isEdit ? "Edit" : "Add"} Category`}
        className="modal-650px responsive"
        backButton
      >
        <Modal.Body ref={modalBodyRef}>
          <Form onSubmit={subValidation.handleSubmit}>
            <div
              className={`${
                subValidation.touched.icon &&
                subValidation.errors.icon &&
                "border-color-invalid"
              } form-control d-flex align-items-center cursor-pointer border br-10 px-3 w-100`}
              onClick={() => {
                setSubCategoryIconModal((pre) => ({ ...pre, isOpen: true })),
                  close();
              }}
            >
              <span className="d-flex w-100 align-items-center justify-content-between">
                <span className="d-flex align-items-center text-color-gray fs-15">
                  {subValidation.values.icon && (
                    <img
                      src={subValidation.values.icon}
                      className="me-2 h-40px w-40px br-8"
                      alt=""
                    />
                  )}
                  Edit Icon & Color{" "}
                </span>
                <span className="">
                  <i className="ri-arrow-right-s-line fs-18"></i>
                </span>
              </span>
            </div>
            {subValidation.touched.icon && subValidation.errors.icon && (
              <span className="text-color-invalid fs-12 text-capitalize mt-1 d-block">
                {subValidation.errors.icon}
              </span>
            )}
            <InputField
              name="title"
              id="title"
              onChange={subValidation.handleChange}
              onBlur={subValidation.handleBlur}
              value={subValidation.values.title}
              invalid={
                subValidation.touched.title && subValidation.errors.title
              }
              errorMessage={subValidation.errors.title}
              className="mb-3 mt-3"
              label="title"
              placeholder="enter title here"
            />
            {/* <SelectField
                className="mb-3"
                label="select type"
                name="type"
                id="type"
                onChange={subValidation.handleChange}
                onBlur={subValidation.handleBlur}
                value={subValidation.values.type}
                invalid={
                  subValidation.touched.type && subValidation.errors.type
                }
                errorMessage={subValidation.errors.type}
              >
                <option value="EXPENSE">expense</option>
                <option value="INCOME">income</option>
              </SelectField> */}
            <SelectField
              className="mb-3"
              label="select type"
              name="iconType"
              id="iconType"
              onChange={subValidation.handleChange}
              onBlur={subValidation.handleBlur}
              value={subValidation.values.iconType}
              invalid={
                subValidation.touched.iconType && subValidation.errors.iconType
              }
              errorMessage={subValidation.errors.iconType}
            >
              <option value="ICON">icon</option>
              <option value="EMOJI">emoji</option>
            </SelectField>
            <SelectField
              label="select nature"
              className=""
              name="nature"
              id="nature"
              onChange={subValidation.handleChange}
              onBlur={subValidation.handleBlur}
              value={subValidation.values.nature}
              invalid={
                subValidation.touched.nature && subValidation.errors.nature
              }
              errorMessage={subValidation.errors.nature}
            >
              <option value="NONE">none</option>
              <option value="MUST">must</option>
              <option value="NEED">need</option>
              <option value="WANT">want</option>
            </SelectField>
            <div className="d-flex gap-3 mt-3 mt-md-4">
              <Button
                onClick={() =>
                  // setIsSubCategory((pre) => ({ ...pre, isOpen: false }))
                  onHide()
                }
                className="light-gray-btn w-100 fs-14  py-2"
              >
                Cancel
              </Button>
              <Button
                disabled={loading || awsLoading}
                type="submit"
                className="primary-btn w-100 fs-14 py-2"
              >
                {loading || awsLoading ? "Loading..." : "Submit"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </ModelWrapper>

      <IconsModal
        isOpen={subCategoryIconModal.isOpen}
        onHide={() => {
          setSubCategoryIconModal((pre) => ({ ...pre, isOpen: false }));
          open();
        }}
        callback={(e) => {
          subValidation.setFieldValue("icon", e.base64);
          subValidation.setFieldValue("color", e.color);
          setSubCategoryIconModal({ isOpen: false, file: e.file });
          open();
        }}
      />
    </>
  );
};

export default AddEditSubCategory;
