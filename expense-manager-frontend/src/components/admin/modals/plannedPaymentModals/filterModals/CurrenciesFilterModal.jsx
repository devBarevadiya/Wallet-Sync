import { useSelector } from "react-redux";
import ModelWrapper from "../../../../ModelWrapper";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getCurrencyThunk } from "../../../../../store/currency/thunk";
import { Button, Form, Modal } from "react-bootstrap";
import { useModalScroll } from "../../../../../helpers/customHooks";

const CurrenciesFilterModal = ({
  isOpen,
  onClose,
  filterKey,
  dispatchFunc,
  filterData = [],
}) => {
  const { flatData, loading } = useSelector((store) => store.Currency);
  const [checked, setChecked] = useState(filterData || []);

  const dispatch = useDispatch();

  const handleSelect = useCallback(() => {
    dispatch(dispatchFunc({ [filterKey]: checked }));
  }, [checked, dispatch, dispatchFunc, filterKey]);

  const closeModal = useCallback(() => {
    // handleSelect();
    onClose();
    setChecked(filterData);
  }, [onClose, filterData]);

  const handleCheck = (value) => {
    if (checked?.includes(value)) {
      const unique = checked.filter((item) => item !== value);
      setChecked(unique);
      // dispatch(dispatchFunc({ [filterKey]: unique }));
    } else {
      setChecked([...checked, value]);
      // dispatch(dispatchFunc({ [filterKey]: [...checked, value] }));
    }
  };

  const handleApply = useCallback(() => {
    onClose();
    dispatch(dispatchFunc({ [filterKey]: checked || [] }));
    setChecked(checked || []);
  }, [checked, dispatch, dispatchFunc, filterKey, onClose]);

  const handleSelectAll = useCallback(() => {
    if (flatData?.length == checked?.length) setChecked([]);
    else setChecked(flatData?.map((item) => item?._id || []));
  }, [flatData, checked?.length]);

  useEffect(() => {
    if (isOpen && !flatData?.length) {
      dispatch(getCurrencyThunk());
    }
  }, [isOpen]);

  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  return (
    <ModelWrapper
      show={isOpen}
      onHide={closeModal}
      className="modal-650px responsive"
      title={`currencies`}
      backButton
    >
      <Modal.Body ref={modalBodyRef} className="pt-0">
        {flatData?.length > 0 ? (
          <>
            <div
              className="d-flex position-sticky top-0 bg-white align-items-center justify-content-between py-3 mb-3 border-bottom border-dark-white-color cursor-pointer"
              onClick={handleSelectAll}
            >
              <span className="user-select-none">Select All</span>
              <Form.Check
                onChange={handleSelectAll}
                checked={checked?.length == flatData?.length}
                id={"select-all-account"}
                className="square-check text-color-light-gray fs-18 ms-4"
              />
            </div>
            <ul className="m-0 p-0 d-flex flex-column gap-3">
              {flatData?.map((item, index) => {
                const id = item?._id;
                const title = item?.currency;

                return (
                  <li
                    key={index}
                    className={`d-flex align-items-center justify-content-between pb-3 border-bottom cursor-pointer  border-dark-white-color`}
                  >
                    <label
                      htmlFor={filterKey + "" + index + 1}
                      className="d-flex gap-3 align-items-center"
                    >
                      <span className="mb-1 fs-18">{title}</span>
                    </label>
                    <Form.Check
                      onChange={() => handleCheck(id)}
                      checked={checked?.includes(id)}
                      id={filterKey + "" + index + 1}
                      className="square-check text-color-light-gray fs-18"
                    />
                  </li>
                );
              })}
            </ul>
            <Modal.Footer className="p-0 mt-4">
              <Button onClick={handleApply} className="w-100 primary-btn m-0">
                Apply
              </Button>
            </Modal.Footer>
          </>
        ) : (
          <span className="d-block text-center client-section-bg-color text-color-gray p-2 br-10">
            {loading ? "Fetching..." : "Oops! No Currency Yet!"}
          </span>
        )}
      </Modal.Body>
    </ModelWrapper>
  );
};

export default CurrenciesFilterModal;
