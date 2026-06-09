import { memo, useCallback, useMemo, useState } from "react";
import ModelWrapper from "../../../ModelWrapper";
import { Modal } from "react-bootstrap";
import HeadcategorySelectModal from "../plannedPaymentModals/filterModals/HeadcategorySelectModal";
import { setFilterData } from "../../../../store/budget/slice";
import { useSelector } from "react-redux";
import CurrenciesFilterModal from "../plannedPaymentModals/filterModals/CurrenciesFilterModal";
import AccountFilterModal from "../plannedPaymentModals/filterModals/AccountFilterModal";
import SelectLabelModal from "../plannedPaymentModals/SelectLabelModal";
import DateFilterModal from "../DateFilterModal";
import PropTypes from "prop-types";
import { useModalScroll } from "../../../../helpers/customHooks";

const FilterModal = ({ isOpen, onClose, open }) => {
  const { filterData } = useSelector((store) => store.Budget);
  const [modal, setModal] = useState("");
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const handleOpenHeadModal = useCallback(() => {
    onClose();
    setModal("categories");
  }, [onClose]);

  const handleCloseModal = useCallback(() => {
    open();
    setModal("");
  }, [open]);

  const closeModal = useCallback(() => {
    setModal("");
  }, []);

  const handleOpenSubModal = useCallback(
    (value) => {
      onClose();
      setModal(value);
    },
    [onClose]
  );

  const filterTitlesData = useMemo(
    () => [
      { title: "categories", value: "categories" },
      { title: "currencies", value: "currencies" },
      { title: "accounts", value: "accounts" },
      { title: "labels", value: "labels" },
      { title: "Date", value: "date" },
    ],
    []
  );

  return (
    <>
      <ModelWrapper
        show={isOpen}
        onHide={onClose}
        className="modal-650px responsive"
        title="Filter"
      >
        <Modal.Body ref={modalBodyRef}>
          <ul className="m-0 p-0 d-flex flex-column gap-3 pt-2">
            {filterTitlesData?.map((item, index) => {
              const title = item?.title;
              const value = item?.value;
              return (
                <li
                  onClick={() => handleOpenSubModal(value)}
                  key={index}
                  className={`d-flex align-items-center justify-content-between text-capitalize cursor-pointer ${
                    index + 1 == filterTitlesData?.length
                      ? ""
                      : "border-bottom border-dark-white-color pb-3"
                  }`}
                >
                  {title}
                  <span className="text-color-light-gray fs-14">
                    All <i className="ri-arrow-right-s-line"></i>
                  </span>
                </li>
              );
            })}
          </ul>
        </Modal.Body>
      </ModelWrapper>

      <HeadcategorySelectModal
        isOpen={modal == "categories"}
        onClose={handleCloseModal}
        open={handleOpenHeadModal}
        close={closeModal}
        filterKey={"categories"}
        dispatchFunc={setFilterData}
        filterData={filterData?.categories}
      />

      <CurrenciesFilterModal
        isOpen={modal == "currencies"}
        filterKey={"currencies"}
        onClose={handleCloseModal}
        dispatchFunc={setFilterData}
        filterData={filterData?.currencies}
      />

      <AccountFilterModal
        isOpen={modal == "accounts"}
        filterKey={"accounts"}
        onClose={handleCloseModal}
        dispatchFunc={setFilterData}
        filterData={filterData?.accounts}
      />

      <SelectLabelModal
        isOpen={modal == "labels"}
        onClose={handleCloseModal}
        // onSelectValue={handleSelectLabel}
        dispatchFunc={setFilterData}
        filterData={filterData?.labels}
      />

      <DateFilterModal
        isShow={modal == "date"}
        onHide={handleCloseModal}
        dispatchFunc={setFilterData}
        fromDate={filterData?.fromDate}
        toDate={filterData?.toDate}
      />
    </>
  );
};

FilterModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  open: PropTypes.func,
};

export default memo(FilterModal);
