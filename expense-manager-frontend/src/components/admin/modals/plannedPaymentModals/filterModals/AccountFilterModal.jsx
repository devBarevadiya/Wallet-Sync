import { useSelector } from "react-redux";
import ModelWrapper from "../../../../ModelWrapper";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { getAccountThunk } from "../../../../../store/actions";
import { Button, Form, Modal } from "react-bootstrap";
import { useModalScroll } from "../../../../../helpers/customHooks";

const AccountFilterModal = ({
  isOpen,
  onClose,
  filterKey,
  dispatchFunc,
  filterData = [],
}) => {
  const { data } = useSelector((store) => store.Account);
  const [checked, setChecked] = useState(filterData || []);

  const dispatch = useDispatch();

  const isShowSelectAllOption = useMemo(
    () => (data?.length > 1 ? true : false),
    [data]
  );

  const handleSelect = useCallback(() => {
    dispatch(dispatchFunc({ [filterKey]: checked }));
  }, [checked, dispatch, filterKey, dispatchFunc]);

  const closeModal = useCallback(() => {
    // handleSelect();
    setChecked(filterData);
    onClose();
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
    // onSelectValues();
  };

  const handleApply = useCallback(() => {
    onClose();
    dispatch(dispatchFunc({ [filterKey]: checked || [] }));
    setChecked(checked || []);
  }, [checked, filterKey, dispatchFunc, dispatch, onClose]);

  const handleSelectAll = useCallback(() => {
    if (data?.length == checked?.length) setChecked([]);
    else setChecked(data?.map((item) => item?._id || []));
  }, [data, checked?.length]);

  useEffect(() => {
    if (isOpen && !data?.length) {
      dispatch(getAccountThunk());
    }
  }, [isOpen]);

  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  return (
    <ModelWrapper
      show={isOpen}
      onHide={closeModal}
      className="modal-650px responsive"
      title={`accounts`}
      backButton
    >
      <Modal.Body ref={modalBodyRef} className={!isShowSelectAllOption ? "" : "pt-0"}>
        {isShowSelectAllOption && (
          <div
            className="d-flex position-sticky top-0 bg-white align-items-center justify-content-between py-3 mb-3 border-bottom border-dark-white-color cursor-pointer"
            onClick={handleSelectAll}
          >
            <span className="user-select-none">Select All</span>
            <Form.Check
              onChange={handleSelectAll}
              checked={checked?.length == data?.length}
              id={"select-all-account"}
              className="square-check text-color-light-gray fs-18 ms-4"
            />
          </div>
        )}
        <ul className="m-0 p-0 d-flex flex-column gap-3">
          {data?.map((item, index) => {
            const id = item?._id;
            const title = item?.title;
            const icon =
              import.meta.env.VITE_DIGITAL_OCEAN_SPACES_BASE_URL +
              item?.accountType?.icon;

            return (
              <li
                key={index}
                className={`d-flex align-items-center justify-content-between cursor-pointer border-bottom pb-3 border-dark-white-color`}
                onClick={() => handleCheck(id)}
              >
                <span
                  htmlFor={filterKey + "" + index + 1}
                  className="d-flex gap-3 align-items-center"
                >
                  <img className="w-45px h-45px br-8" src={icon} alt="" />
                  <h6 className="mb-1 fs-18 text-break truncate-line-1">
                    {title}
                  </h6>
                </span>
                <Form.Check
                  onChange={() => handleCheck(id)}
                  checked={checked?.includes(id)}
                  id={filterKey + "" + index + 1}
                  className="square-check text-color-light-gray fs-18 ms-4"
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
      </Modal.Body>
    </ModelWrapper>
  );
};

export default AccountFilterModal;
