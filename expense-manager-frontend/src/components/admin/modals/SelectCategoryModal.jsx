import {
  Button,
  ButtonToolbar,
  Col,
  Form,
  Modal,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  awsThunk,
  createHeadThunk,
  getCategoryThunk,
} from "../../../store/actions";
import SearchField from "../../inputFields/SearchField";
import CategoryModal from "./CategoryModal";
import InputField from "../../inputFields/InputField";
import SelectField from "../../inputFields/SelectField";
import * as yup from "yup";
import { useFormik } from "formik";
import IconsModal from "./IconsModal";
import ShowAllSubCategoryModal from "./ShowAllSubCategoryModal";
import { setSelectedCategory } from "../../../store/category/slice";
import DynamicLordIcon from "../../DynamicLordIcon";
import { transactionTypeEnum } from "../../../helpers/enum";
import AddEditHeadCategory from "./AddEditHeadCategory";
import {
  countCustomCategory,
  isNotPremium,
} from "../../../helpers/commonFunctions";
import PremiumModal from "./PremiumModal";
import { useModalScroll } from "../../../helpers/customHooks";

const SelectCategoryModal = ({
  open,
  close,
  isOpen,
  onHide,
  onSelectCategory,
  animation = true,
  backdropClassName = "",
  filterKey = "",
}) => {
  const { data, loading, mostUsed, accessLimit } =
    useSelector((state) => state.Category) || "";
  const filterByKey = useMemo(() => {
    if (!data) return [];

    return [...data].sort((a, b) =>
      a.type === filterKey ? -1 : b.type === filterKey ? 1 : 0
    );
  }, [data, filterKey]);

  const { uploadLoading: awsLoading } = useSelector((store) => store.Aws);
  const [searchValue, setSearchValue] = useState("");
  const [isHeadFields, setIsHeadFields] = useState(false);
  const [filterData, setFilterData] = useState(filterByKey);
  const [isModal, setIsModal] = useState(false);
  const [file, setFile] = useState("");
  const [addEditCategoryModal, setAddEditCategoryModal] = useState(false);
  const [premiumModal, setPremiumModal] = useState(false);
  const [isAllCategoryModal, setIsAllCategoryModal] = useState(false);
  const dispatch = useDispatch();

  const handleSearch = (e) => {
    const searchValue = e.toLowerCase();
    const filter = filterByKey?.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(searchValue);
      const subCategory = item?.categories?.some((category) =>
        category.title.toLowerCase().includes(searchValue)
      );
      return titleMatch || subCategory;
    });
    setSearchValue(e);
    setFilterData(filter);
    // if (e.key == "Enter") {
    // }
  };

  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const handleHide = () => {
    setFilterData(filterByKey);
    setSearchValue("");
    setIsHeadFields(false);
    open && open();
    onHide();
  };

  const handleOpenPreminumModal = useCallback(() => {
    close();
    setPremiumModal(true);
  }, [close]);

  const handleClosePreminumModal = useCallback(() => {
    setPremiumModal(false);
    open && open();
  }, [open]);

  const handleOpenHeadModal = useCallback(() => {
    if (isNotPremium() && accessLimit <= countCustomCategory()) {
      handleOpenPreminumModal();
    } else {
      setIsHeadFields(true), close();
    }
  }, [close, handleOpenPreminumModal, accessLimit]);

  const handleCloseHeadModal = useCallback(() => {
    setIsHeadFields(false), open();
  }, [open]);

  const handleOpen = useCallback(() => {
    // open();
    setIsHeadFields(true);
  }, [open]);

  const handleCloseDirect = useCallback(() => {
    setIsHeadFields(false);
  }, []);

  const handleOpenSubModalDirect = useCallback(() => {
    setIsAllCategoryModal(true);
    close();
  }, [close]);

  const handleCloseSubModalDirect = useCallback(() => {
    setIsAllCategoryModal(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      dispatch(getCategoryThunk());
    }
    // if (isOpen && !data?.length > 0) {
    //   dispatch(getCategoryThunk());
    // }
  }, [isOpen, dispatch]);

  useEffect(() => {
    setFilterData(filterByKey);
  }, [filterByKey]);

  return (
    <div>
      <Modal
        show={isOpen}
        centered={true}
        onHide={handleHide}
        className="modal-650px category-modal responsive"
        backdropClassName={backdropClassName}
        animation={animation}
      >
        <Modal.Header className="mb-3 border-bottom pb-3 pe-4">
          <div className="d-flex align-items-center justify-content-between w-100">
            <Modal.Title className="text-capitalize fs-21 responsive">
              <i
                className="ri-arrow-left-line cursor-pointer fs-4 me-3"
                onClick={handleHide}
              ></i>
              Categories
            </Modal.Title>
            {/* <span className="h-30px w-30px br-10 d-flex justify-content-center align-items-center bg-color-primary text-white cursor-pointer">
            <img
              src={Image.addWithBg}
              alt="addWithBg"
              className="h-30px w-30px p-1"
            />
          </span> */}
            <ButtonToolbar className="justify-content-end">
              <OverlayTrigger
                placement="left"
                overlay={<Tooltip id="tooltip">Add Head Category</Tooltip>}
              >
                <i
                  onClick={handleOpenHeadModal}
                  // onClick={() => setIsHeadFields((pre) => !pre)}
                  className={`${
                    !isHeadFields ? " ri-add-large-line" : "ri-close-line"
                  } bg-color-primary fs-12 fw-bold text-white h-30px w-30px br-10 d-flex justify-content-center align-items-center cursor-pointer`}
                ></i>
              </OverlayTrigger>
            </ButtonToolbar>
          </div>
        </Modal.Header>
        <Modal.Body ref={modalBodyRef} className="invisible-scrollbar pt-2 max-h-80vh">
          {/* <Modal.Body className="invisible-scrollbar pt-2 h-80vh"> */}
          <SearchField
            groupClass={"pb-3"}
            onChange={(e) => handleSearch(e.target.value)}
            // onKeyDown={handleSearch}
            id="search"
            value={searchValue}
            onClear={() => {
              setFilterData(filterByKey), setSearchValue("");
            }}
            placeholder="search category here..."
          />
          {!loading && mostUsed?.length > 0 ? (
            <>
              <div className="d-flex align-items-center justify-content-between mt-3">
                <h6 className="p-0 m-0 fs-16 max-w-300px text-truncate me-3 text-capitalize">
                  Most Used
                </h6>
              </div>
              <Row className="m-2 br-18 pb-3  primary-bottom-shadow">
                {mostUsed?.map((item, index) => {
                  const icon = item?.icon;
                  const title = item?.title;
                  return (
                    <Col
                      xs={4}
                      sm={3}
                      md={2}
                      key={index}
                      className="cursor-pointer"
                      onClick={() => {
                        onSelectCategory(item), open(), onHide();
                      }}
                    >
                      <img
                        src={
                          import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                          icon
                        }
                        className="w-40px h-40px mx-auto d-block mt-4 br-8"
                      />
                      <span className="responsive text-center d-block fs-12 mt-2 fw-medium text-break truncate-line-2">
                        {title}
                      </span>
                    </Col>
                  );
                })}
              </Row>
            </>
          ) : (
            ""
          )}
          {!loading && filterData?.length ? (
            filterData?.map((item, index) => {
              const title = item?.title;
              const categories = item?.categories;
              return (
                <React.Fragment key={index}>
                  <div className="d-flex align-items-center justify-content-between mt-3">
                    <h6 className="p-0 m-0 fs-16 max-w-300px text-truncate me-3 text-capitalize">
                      {title}
                    </h6>
                    <span
                      className="fs-13 text-color-primary cursor-pointer"
                      onClick={() => {
                        setIsAllCategoryModal(true),
                          dispatch(setSelectedCategory(item)),
                          close();
                      }}
                    >
                      Edit
                    </span>
                  </div>
                  <Row className="m-2 br-18 pb-3  primary-bottom-shadow">
                    {categories?.length ? (
                      categories?.map((item, index) => {
                        const icon = item?.icon;
                        const title = item?.title;
                        return (
                          <Col
                            xs={4}
                            sm={3}
                            md={2}
                            key={index}
                            className="cursor-pointer"
                            onClick={() => {
                              onSelectCategory(item), open(), onHide();
                            }}
                          >
                            <img
                              src={
                                import.meta.env
                                  .VITE_DIGITAL_OCEAN_SPACES_BASE_URL + icon
                              }
                              className="w-40px h-40px mx-auto d-block mt-4 br-8"
                            />
                            <span className="responsive text-center d-block fs-12 mt-2 fw-medium text-break truncate-line-2">
                              {title}
                            </span>
                          </Col>
                        );
                      })
                    ) : (
                      <div className="text-center text-color-light-gray mt-3">
                        No Category yet
                      </div>
                    )}
                  </Row>
                </React.Fragment>
              );
            })
          ) : (
            <div>
              <DynamicLordIcon
                coverClass="bg-white"
                icon="wjyqkiew"
                subTitle={
                  loading
                    ? "Category Fetching for the provided filter. Please wait"
                    : "No category found for the provided filter."
                }
                title={
                  loading
                    ? "Fetching latest categories..."
                    : "Oops! category Not Found!"
                }
              />
            </div>
          )}
        </Modal.Body>
      </Modal>
      {/* <CategoryModal
        isOpen={addEditCategoryModal}
        onHide={() => setAddEditCategoryModal(false)}
      /> */}

      <ShowAllSubCategoryModal
        open={handleOpenSubModalDirect}
        close={handleCloseSubModalDirect}
        isOpen={isAllCategoryModal}
        onHide={() => {
          setIsAllCategoryModal(false);
          open();
          dispatch(setSelectedCategory({}));
        }}
        onSuccess={() => {
          open(),
            setIsAllCategoryModal(false),
            dispatch(setSelectedCategory({}));
        }}
      />

      <AddEditHeadCategory
        isOpen={isHeadFields}
        onHide={handleCloseHeadModal}
        open={handleOpen}
        close={handleCloseDirect}
        filterKey={filterKey}
      />

      <PremiumModal
        isShow={premiumModal}
        onHide={handleClosePreminumModal}
        // onUpgrade={handleHide}
      />
    </div>
  );
};

SelectCategoryModal.propTypes = {
  isOpen: PropTypes.bool,
  animation: PropTypes.bool,
  onHide: PropTypes.func,
  onSelectCategory: PropTypes.func,
  backdropClassName: PropTypes.string,
  filterKey: PropTypes.string,
};

export default memo(SelectCategoryModal);
