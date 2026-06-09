import { useCallback, useState, useMemo, useEffect } from "react";
import ModelWrapper from "../../../ModelWrapper";
import { Form, Modal } from "react-bootstrap";
import { toastError, toastSuccess } from "../../../../config/toastConfig";
import { useDispatch } from "react-redux";
import {
  deletePromoCodeThunk,
  getPromoCodeThunk,
} from "../../../../store/promoCode/thunk";
import { useSelector } from "react-redux";
import { useModalScroll } from "../../../../helpers/customHooks";

const ShowPromoCodesModal = ({ isOpen, onHide }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const dispatch = useDispatch();
  const today = new Date();
  const todayFormatted = today.toISOString().split("T")[0];
  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const { showCodes } = useSelector((store) => store.PromoCode);

  // Memoize the handleClose function
  const handleClose = useCallback(() => {
    onHide();
  }, [onHide]);

  // Memoize the handleCopy function
  const handleCopy = useCallback((text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toastSuccess(`${text} copied to clipboard!`))
      .catch((err) => console.error(err));
  }, []);

  // Handle individual checkbox change
  const handleCheckboxChange = useCallback((index) => {
    setSelectedIds((prev) =>
      prev.includes(index)
        ? prev.filter((id) => id !== index)
        : [...prev, index]
    );
  }, []);

  // Handle "Select All" checkbox
  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === showCodes?.length) {
      setSelectedIds([]); // Deselect all
    } else {
      setSelectedIds(showCodes?.map((item) => item?._id)); // Select all
    }
  }, [showCodes, selectedIds.length]);

  const handleDelete = useCallback(async () => {
    if (!selectedIds?.length > 0) {
      toastError("Select At Least 1 Code");
    } else {
      await dispatch(deletePromoCodeThunk({ ids: selectedIds }));
      await dispatch(getPromoCodeThunk());
      const filterData = showCodes?.filter(
        (item) => !selectedIds?.includes(item?._id)
      );
      !filterData?.length > 0 && onHide();
      setSelectedIds([]);
    }
  }, [selectedIds, onHide, showCodes]);

  // Memoize the list rendering to prevent unnecessary re-renders
  const promoCodeList = useMemo(() => {
    return showCodes.map((item, index) => {
      const code = item?.code;
      const id = item?._id;
      const user = item?.user;
      const givenDate = new Date(item?.expiresOn || item?.validUntil);
      const givenDateFormatted = givenDate?.toISOString().split("T")[0];
      const result = todayFormatted <= givenDateFormatted;

      return (
        <li
          key={index}
          className={`${
            index % 2 === 0 ? "client-section-bg-color" : ""
          } px-3 py-15px br-8 d-flex align-items-center justify-content-between`}
        >
          <span className="d-flex gap-3">
            <Form.Check
              checked={selectedIds.includes(id)}
              id={`${index}-code`}
              className="square-check lg mb-1"
              onChange={() => handleCheckboxChange(id)}
            />
            <label htmlFor={`${index}-code`} className="cursor-pointer">
              {code}
              {(!result || user !== null) &&
                (result ? (
                  <span className="fs-12 bg-color-lightest-green px-3 py-1 ms-3 br-10 text-color-green">
                    In Use
                  </span>
                ) : (
                  <span className="fs-12 bg-color-red-lightest px-3 py-1 ms-3 br-10 text-color-red">
                    Expired
                  </span>
                ))}
              {/* {expireResult && (
                <span className="fs-12 bg-color-lightest-green px-3 py-1 ms-3 br-10 text-color-green">
                  In Use
                </span>
              )} */}
            </label>
          </span>
          <i
            onClick={() => handleCopy(code)}
            className="ri-file-copy-2-line cursor-pointer text-color-gray fs-19"
          />
        </li>
      );
    });
  }, [showCodes, selectedIds, handleCopy, handleCheckboxChange]);

  return (
    <ModelWrapper
      show={isOpen}
      onHide={handleClose}
      className="modal-650px"
      title={"Promo Codes"}
    >
      <Modal.Body ref={modalBodyRef} className="max-h-80vh pt-0">
        <div className="px-2 py-4 d-flex justify-content-between position-sticky top-0 bg-white">
          <span className="d-flex align-items-center gap-3">
            <Form.Check
              id="select-all-code"
              className="square-check lg mb-1"
              checked={
                selectedIds?.length == showCodes?.length &&
                showCodes?.length > 0
              }
              onChange={handleSelectAll}
            />
            <label
              htmlFor="select-all-code"
              className="cursor-pointer user-select-none"
            >
              Select All
            </label>
          </span>
          <i
            onClick={handleDelete}
            className="ri-delete-bin-line fs-19 cursor-pointer text-color-invalid"
          ></i>
        </div>

        <ul className="p-0 m-0">{promoCodeList}</ul>
      </Modal.Body>
    </ModelWrapper>
  );
};

export default ShowPromoCodesModal;
