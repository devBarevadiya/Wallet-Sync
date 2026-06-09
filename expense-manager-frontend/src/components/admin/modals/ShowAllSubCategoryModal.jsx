import { useFormik } from "formik";
import {
  Button,
  ButtonToolbar,
  Form,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import * as yup from "yup";
import SelectField from "../../inputFields/SelectField";
import InputField from "../../inputFields/InputField";
import { useCallback, useState } from "react";
import IconsModal from "./IconsModal";
import {
  awsThunk,
  createCategoryThunk,
  updateCategoryThunk,
  updateHeadThunk,
} from "../../../store/actions";
import { useDispatch, useSelector } from "react-redux";
import DynamicLordIcon from "../../DynamicLordIcon";
import { transactionTypeEnum } from "../../../helpers/enum";
import AddEditHeadCategory from "./AddEditHeadCategory";
import AddEditSubCategory from "./AddEditSubCategory";
import { setSelectedSubCategory } from "../../../store/category/slice";
import {
  countCustomCategory,
  isNotPremium,
} from "../../../helpers/commonFunctions";
import PremiumModal from "./PremiumModal";
import { useModalScroll } from "../../../helpers/customHooks";

const ShowAllSubCategoryModal = ({
  isOpen,
  onHide,
  open,
  close,
  onSuccess,
}) => {
  const [isHeadFields, setIsHeadFields] = useState(false);
  const [premiumModal, setPremiumModal] = useState(false);
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const { selectedCategory, loading, accessLimit } = useSelector(
    (store) => store.Category
  );
  const { uploadLoading: awsLoading } = useSelector((store) => store.Aws);
  const [subCategory, setIsSubCategory] = useState({ data: {}, isOpen: false });
  const [categoryIconModal, setCategoryIconModal] = useState({
    isOpen: false,
    file: "",
  });
  const [subCategoryIconModal, setSubCategoryIconModal] = useState({
    isOpen: false,
    file: "",
  });
  const dispatch = useDispatch();
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
    type: selectedCategory?.type || "",
  };

  const validationSchema = yup.object({
    icon: yup.string().required(),
  });

  const validation = useFormik({
    name: "head-category-validation",
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
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
        }
        return;
      }
      await updateHeadHandler({ ...values, icon: selectedCategory.icon });
    },
  });

  const handleCloseHeadModal = useCallback(() => {
    setIsHeadFields(false), open();
  }, [open]);

  const onSuccessHeadCategory = useCallback(() => {
    setIsHeadFields(false);
    onSuccess();
  }, [onSuccess]);

  const handleOpenDirect = useCallback(() => {
    setIsHeadFields(true);
  }, []);

  const handleCloseDirect = useCallback(() => {
    setIsHeadFields(false);
  }, []);

  const handleOpenPreminumModal = useCallback(() => {
    close();
    setPremiumModal(true);
  }, [close]);

  const handleClosePreminumModal = useCallback(() => {
    setPremiumModal(false);
    open && open();
  }, [open]);

  return (
    <div>
      <Modal
        show={isOpen}
        centered={true}
        onHide={() => {
          setIsSubCategory({ data: {}, isOpen: false }), validation.resetForm();
          onHide();
        }}
        className="modal-650px category-modal responsive"
        // backdropClassName="bg-transparent"
        // animation={false}
      >
        <Modal.Header className="border-bottom common-border-color pb-3">
          <div className="d-flex align-items-center justify-content-between w-100">
            <Modal.Title className="text-capitalize fs-21 responsive d-flex justify-content-between w-100 align-items-center">
              <span className="d-flex align-items-center">
                <i
                  className="ri-arrow-left-line cursor-pointer fs-4 me-3"
                  onClick={() => {
                    setIsSubCategory({ data: {}, isOpen: false }),
                      validation.resetForm();
                    onHide();
                  }}
                ></i>

                {selectedCategory?.title ? (
                  <span className="max-w-300px d-block text-truncate text-nowrap">
                    Edit - {selectedCategory?.title}
                  </span>
                ) : (
                  <span>Edit Head Category</span>
                )}
              </span>
              <ButtonToolbar className="justify-content-end">
                <OverlayTrigger
                  placement="left"
                  overlay={<Tooltip id="tooltip">Edit Head Category</Tooltip>}
                >
                  <i
                    onClick={() => {
                      setIsHeadFields(true), close();
                    }}
                    className="ri-pencil-fill text-color-primary fs-20 cursor-pointer"
                  ></i>
                </OverlayTrigger>
              </ButtonToolbar>
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body ref={modalBodyRef} className="">
          {/* <Modal.Body className="h-82vh"> */}
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="p-0 m-0">Category</h6>
            <ButtonToolbar className="justify-content-end">
              <OverlayTrigger
                placement="left"
                overlay={<Tooltip id="tooltip">Add Sub Category</Tooltip>}
              >
                <i
                  id="add-category"
                  onClick={() => {
                    if (
                      isNotPremium() &&
                      accessLimit <= countCustomCategory()
                    ) {
                      handleOpenPreminumModal();
                    } else {
                      setIsSubCategory((pre) => ({
                        ...pre,
                        isOpen: !pre.isOpen,
                      }));
                      close();
                    }
                  }}
                  className={`${
                    subCategory.isOpen ? "ri-close-line" : "ri-add-large-line"
                  } bg-color-primary ms-auto fs-12 fw-bold text-white h-30px w-30px br-10 d-flex justify-content-center align-items-center cursor-pointer`}
                ></i>
              </OverlayTrigger>
            </ButtonToolbar>
          </div>

          <ul className="p-0 m-0">
            {subCategoryData?.map((item, index) => {
              const icon =
                import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                  item?.icon || "";
              const title = item?.title || "";
              return (
                <li
                  key={index}
                  className="mb-2 cursor-pointer"
                  onClick={() => {
                    setIsSubCategory({ data: item, isOpen: true }),
                      dispatch(setSelectedSubCategory(item));
                    close();
                  }}
                >
                  <a className="border common-border-color br-8 p-2 d-flex align-items-center justify-content-between">
                    <span className="text-color-gray fs-15 text-truncate">
                      <img
                        className="h-40px w-40px me-1 br-8"
                        src={icon}
                        alt=""
                      />{" "}
                      {title}
                    </span>
                    <i className="ri-arrow-right-s-line fs-18"></i>
                  </a>
                </li>
              );
            })}
          </ul>
          {!subCategoryData?.length && (
            <div className="br-8 overflow-hidden">
              <DynamicLordIcon
                title="Oops ! No Categories Yet !"
                subTitle="You will have to add Categories to show here"
              />
            </div>
          )}
        </Modal.Body>
      </Modal>
      <IconsModal
        isOpen={categoryIconModal.isOpen}
        onHide={() =>
          setCategoryIconModal((pre) => ({ ...pre, isOpen: false }))
        }
        callback={(e) => {
          validation.setFieldValue("icon", e.base64),
            setCategoryIconModal({ isOpen: false, file: e.file });
        }}
      />

      <AddEditHeadCategory
        isOpen={isHeadFields}
        onHide={handleCloseHeadModal}
        open={handleOpenDirect}
        close={handleCloseDirect}
        filterKey={""}
        onSuccess={onSuccessHeadCategory}
      />

      <AddEditSubCategory
        open={() => setIsSubCategory((pre) => ({ ...pre, isOpen: true }))}
        isOpen={subCategory.isOpen}
        onHide={() => {
          setIsSubCategory((pre) => ({ ...pre, isOpen: false })),
            open(),
            dispatch(setSelectedSubCategory({}));
        }}
        close={() => setIsSubCategory((pre) => ({ ...pre, isOpen: false }))}
        onSuccess={() => {
          setIsSubCategory((pre) => ({ ...pre, isOpen: false })),
            onSuccess(),
            dispatch(setSelectedSubCategory({}));
        }}
      />

      <PremiumModal isShow={premiumModal} onHide={handleClosePreminumModal} />
    </div>
  );
};

export default ShowAllSubCategoryModal;
