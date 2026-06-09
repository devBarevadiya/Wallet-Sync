import { memo, useCallback, useMemo, useState } from "react";
import ModelWrapper from "../../ModelWrapper";
import * as yup from "yup";
import IconsModal from "./IconsModal";
import { useDispatch } from "react-redux";
import { transactionTypeEnum } from "../../../helpers/enum";
import { useFormik } from "formik";
import {
  awsThunk,
  createHeadThunk,
  updateHeadThunk,
} from "../../../store/actions";
import { Button, Form, Modal } from "react-bootstrap";
import InputField from "../../inputFields/InputField";
import SelectField from "../../inputFields/SelectField";
import { useSelector } from "react-redux";
import { useModalScroll } from "../../../helpers/customHooks";

const AddEditHeadCategory = ({
  isOpen,
  onHide,
  filterKey,
  close,
  open,
  onSuccess,
}) => {
  const [isModal, setIsModal] = useState(false);
  const [file, setFile] = useState("");
  const [categoryIconModal, setCategoryIconModal] = useState({
    isOpen: false,
    file: "",
  });
  const { uploadLoading: awsLoading } = useSelector((store) => store.Aws);
  const { selectedCategory, loading } = useSelector((store) => store.Category);
  const dispatch = useDispatch();
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const isEdit = useMemo(
    () => Object.keys(selectedCategory)?.length > 0,
    [selectedCategory]
  );

  const icon =
    selectedCategory?.icon &&
    import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL + selectedCategory?.icon;
  const subCategoryData = selectedCategory?.categories || [];

  const awsHandler = async (file, dirName = "category") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dirName", dirName);
    return await dispatch(awsThunk(formData));
  };

  const initialValues = {
    icon: icon || "",
    title: selectedCategory?.title || "",
    type:
      selectedCategory?.type || filterKey || transactionTypeEnum.EXPENSE || "",
  };

  const validationSchema = yup.object({
    title: yup.string().required("Title is required"),
    type: yup.string().required("type is required"),
    icon: yup.string().required("icon is required"),
  });

  const validation = useFormik({
    name: "head-category-validation",
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      if (isEdit) {
        const updateHeadHandler = async (values) => {
          // delete values.type
          const response = await dispatch(
            updateHeadThunk({
              id: selectedCategory._id,
              values,
            })
          );
          return response;
        };
        if (categoryIconModal.file) {
          const awsImg = await awsHandler(categoryIconModal.file);
          if (awsThunk.fulfilled.match(awsImg)) {
            await updateHeadHandler({ ...values, icon: awsImg.payload.data });
            onHide();
            onSuccess && onSuccess();
            resetForm();
            setFile("");
            setCategoryIconModal({});
          }
          return;
        }
        await updateHeadHandler({
          ...values,
          icon: selectedCategory.icon,
        });
        onHide();
        onSuccess && onSuccess();
        resetForm();
        setFile("");
        setCategoryIconModal({});
      } else {
        const formData = new FormData();
        // formData.append("title", values.title);
        // formData.append("type", values.type);
        formData.append("file", file);
        formData.append("dirName", validation.values.title);
        const awsImg = await dispatch(awsThunk(formData));
        if (awsThunk.fulfilled.match(awsImg)) {
          const response = await dispatch(
            createHeadThunk({ ...values, icon: awsImg.payload.data })
          );
          if (createHeadThunk.fulfilled.match(response)) {
            onHide();
            resetForm();
            setFile("");
          }
        }
      }
    },
  });

  const handleCloseNReset = useCallback(() => {
    onHide();
    validation.resetForm();
  }, [onHide]);

  return (
    <>
      <ModelWrapper
        show={isOpen}
        onHide={handleCloseNReset}
        title={`${isEdit ? "Edit" : "Add"} Head Category`}
        className="modal-650px responsive"
        backButton
      >
        <Modal.Body ref={modalBodyRef}>
          <Form onSubmit={validation.handleSubmit} id="add-head" className="">
            <label className="fs-16 fw-semibold mb-2">Icon</label>
            <div
              className={`${
                validation.touched.icon &&
                validation.errors.icon &&
                "border-color-invalid"
              } form-control d-flex align-items-center cursor-pointer border br-10 px-3 w-100`}
              onClick={() => {
                setIsModal(true), close();
              }}
            >
              <span className="d-flex w-100 align-items-center justify-content-between">
                <span className="d-flex align-items-center text-color-gray fs-15">
                  {validation.values.icon && (
                    <img
                      src={validation.values.icon}
                      className="me-2 w-45px h-45px br-10"
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
            <InputField
              name="title"
              id="title"
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.title}
              invalid={validation.touched.title && validation.errors.title}
              errorMessage={validation.errors.title}
              className="my-3 my-md-4"
              label="title"
              placeholder="enter title here"
            />
            <SelectField
              label="select type"
              className=""
              name="type"
              id="type"
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.type}
              invalid={validation.touched.type && validation.errors.type}
              errorMessage={validation.errors.type}
              // disabled={filterKey}
            >
              <option value={transactionTypeEnum.EXPENSE}>expense</option>
              <option value={transactionTypeEnum.INCOME}>income</option>
            </SelectField>
            <div className="d-flex gap-3 mt-3 mt-md-4">
              <Button
                onClick={handleCloseNReset}
                className="light-gray-btn w-100 fs-14  py-2"
              >
                Cancel
              </Button>
              <Button
                disabled={loading || awsLoading}
                className="primary-btn w-100 fs-14 py-2"
                type="submit"
              >
                {loading || awsLoading ? "Loading..." : "Submit"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </ModelWrapper>

      {!isEdit ? (
        <IconsModal
          isOpen={isModal}
          open={open}
          close={close}
          onHide={() => {
            open(), setIsModal(false);
          }}
          callback={(e) => {
            validation.setFieldValue("icon", e.base64),
              setIsModal(false),
              open();
            setFile(e.file);
          }}
        />
      ) : (
        <IconsModal
          open={open}
          close={close}
          isOpen={isModal}
          onHide={() => {
            open(), setIsModal(false);
          }}
          callback={(e) => {
            validation.setFieldValue("icon", e.base64),
              setCategoryIconModal((pre) => ({ ...pre, file: e.file }));
            setIsModal(false), open();
          }}
        />
      )}
    </>
  );
};

export default memo(AddEditHeadCategory);
