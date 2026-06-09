import { memo, useCallback, useEffect, useState } from "react";
import ModelWrapper from "../../../../ModelWrapper";
import { Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { getCategoryThunk } from "../../../../../store/actions";
import CategoryFilterModal from "./CategoryFilterModal";
import { useModalScroll } from "../../../../../helpers/customHooks";

const HeadcategorySelectModal = ({
  isOpen,
  onClose,
  filterKey,
  open,
  close,
  dispatchFunc,
  filterData,
}) => {
  const { data, loading } = useSelector((store) => store.Category);
  const disptach = useDispatch();
  const [selectedData, setSelectedData] = useState([]);
  const [isCategoryModal, setIsCategoryModal] = useState(false);

  const closeModal = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleOpenCategoryModal = useCallback(() => {
    close();
    setIsCategoryModal(true);
  }, []);

  const handleCloseCategoryModal = useCallback(() => {
    open();
    setIsCategoryModal(false);
  }, []);

  useEffect(() => {
    if (isOpen && !data?.length) {
      disptach(getCategoryThunk());
    }
  }, [isOpen]);

  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  return (
    <>
      <ModelWrapper
        show={isOpen}
        onHide={closeModal}
        className="modal-650px responsive"
        title={`head categories`}
        backButton
      >
        <Modal.Body ref={modalBodyRef}>
          {data?.length > 0 ? (
            <ul className="p-0 m-0 d-flex flex-column gap-3">
              {data?.map((item, index) => {
                const title = item?.title;
                const icon =
                  import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
                  item?.icon;
                const categories = item?.categories || [];

                return (
                  <li
                    onClick={() => {
                      setSelectedData(categories), handleOpenCategoryModal();
                    }}
                    key={index}
                    className={`d-flex align-items-center justify-content-between text-capitalize cursor-pointer ${
                      index + 1 == data?.length
                        ? ""
                        : "border-bottom border-dark-white-color pb-3"
                    }`}
                  >
                    <span
                      htmlFor={filterKey + "" + index + 1}
                      className="text-capitalize p-0 m-0 d-flex gap-3 align-items-center fw-medium"
                    >
                      <img className="w-45px h-45px br-8" src={icon} alt="" />
                      <span className="text-break text-wrap truncate-line-1">
                        {title}
                      </span>
                    </span>
                    <i className="ri-arrow-right-s-line fs-24 text-color-gray ms-4"></i>
                  </li>
                );
              })}
            </ul>
          ) : (
            <span className="d-block text-center client-section-bg-color text-color-gray p-2 br-10">
              {loading ? "Fetching..." : "Oops! No Category Yet!"}
            </span>
          )}
        </Modal.Body>
      </ModelWrapper>
      <CategoryFilterModal
        isOpen={isCategoryModal}
        onClose={handleCloseCategoryModal}
        filterKey={filterKey}
        data={selectedData}
        dispatchFunc={dispatchFunc}
        filterData={filterData}
      />
    </>
  );
};

export default memo(HeadcategorySelectModal);
