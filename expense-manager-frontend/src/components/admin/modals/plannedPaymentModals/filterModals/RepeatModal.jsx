import { useCallback, useEffect, useState } from "react";
import ModelWrapper from "../../../../ModelWrapper";
import { Button, Form, Modal } from "react-bootstrap";
import { everyTypeEnum } from "../../../../../helpers/enum";
import { useDispatch } from "react-redux";

const RepeatModal = ({
  isOpen,
  onClose,
  filterKey,
  dispatchFunc,
  filterData,
}) => {
  const [checked, setChecked] = useState([]);
  const dispatch = useDispatch();

  const handleSelect = useCallback(
    (value) => {
      dispatch(dispatchFunc({ [filterKey]: value }));
    },
    [dispatch, dispatchFunc, filterKey]
  );

  const closeModal = useCallback(() => {
    // handleSelect();
    onClose();
  }, [onClose]);

  const handleCheck = (value) => {
    if (checked?.includes(value)) {
      const filter = checked.filter((item) => item !== value);
      setChecked(filter);
      // handleSelect(filter);
    } else {
      setChecked([...checked, value]);
      // handleSelect([...checked, value]);
    }
  };

  const handleApply = useCallback(() => {
    handleSelect(checked);
    closeModal();
  }, [closeModal, handleSelect, checked]);

  const data = [
    {
      title: "repeat daily",
      value: everyTypeEnum.DAY,
    },
    {
      title: "repeat weekly",
      value: everyTypeEnum.WEEK_DAY,
    },
    {
      title: "repeat monthly",
      value: everyTypeEnum.MONTH,
    },
    {
      title: "repeat yearly",
      value: everyTypeEnum.YEAR,
    },
  ];

  useEffect(() => {
    if (isOpen) setChecked(filterData || []);
  }, [isOpen, filterData]);

  return (
    <ModelWrapper
      show={isOpen}
      onHide={closeModal}
      className="modal-650px responsive"
      title={`repeat`}
      backButton
    >
      <Modal.Body>
        <ul className="m-0 p-0 d-flex flex-column gap-3">
          {data?.map((item, index) => {
            const title = item?.title;
            const value = item?.value;
            return (
              <li
                key={index}
                className={`d-flex align-items-center justify-content-between text-capitalize cursor-pointer border-bottom border-dark-white-color pb-3`}
                onClick={() => handleCheck(value)}
              >
                <span className="text-capitalize p-0 m-0 user-select-none cursor-pointer">
                  {title}
                </span>
                <Form.Check
                  onChange={() => handleCheck(value)}
                  checked={checked?.includes(value)}
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
      </Modal.Body>
    </ModelWrapper>
  );
};

export default RepeatModal;
