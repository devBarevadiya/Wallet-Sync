import { memo, useCallback, useState } from "react";
import ModelWrapper from "../../../../ModelWrapper";
import { Button, Form, Modal } from "react-bootstrap";
import { scheduleTypeEnum } from "../../../../../helpers/enum";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useModalScroll } from "../../../../../helpers/customHooks";

const ScheduleTypeModal = ({ isOpen, onClose, dispatchFunc, filterData }) => {
  const [selectedValue, setSelectedValue] = useState(filterData || "");

  const dispatch = useDispatch();

  const handleSelect = useCallback(
    (value) => {
      dispatch(dispatchFunc({ scheduleType: value }));
    },
    [dispatch, dispatchFunc]
  );

  const closeModal = useCallback(() => {
    // handleSelect();
    onClose();
    setSelectedValue(filterData);
  }, [onClose, filterData]);

  const data = [
    {
      title: "one time",
      value: scheduleTypeEnum.ONE_TIME,
    },
    {
      title: "repeat",
      value: scheduleTypeEnum.REPEAT,
    },
  ];

  const handleCheck = (value) => {
    if (selectedValue == value) {
      setSelectedValue("");
      // handleSelect("");
    } else {
      setSelectedValue(value);
      // handleSelect(value);
    }
  };

  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  const handleApply = useCallback(() => {
    handleSelect(selectedValue);
    closeModal();
  }, [closeModal, handleSelect, selectedValue]);

  return (
    <ModelWrapper
      show={isOpen}
      onHide={closeModal}
      className="modal-650px responsive"
      title={`schedule type`}
      backButton
    >
      <Modal.Body ref={modalBodyRef}>
        <ul className="m-0 p-0 d-flex flex-column gap-3">
          {data?.map((item, index) => {
            const title = item?.title;
            const value = item?.value;
            return (
              <li
                key={index}
                className={` text-capitalize border-bottom border-dark-white-color pb-3 `}
              >
                <span
                  className="d-flex align-items-center justify-content-between cursor-pointer"
                  onClick={() => handleCheck(value)}
                >
                  <span className="text-capitalize p-0 m-0 user-select-none">
                    {title}
                  </span>
                  <Form.Check
                    onChange={() => handleCheck(value)}
                    checked={selectedValue == value}
                    id={`scheduleType${index + 1}`}
                    className="square-check text-color-light-gray fs-18 ms-4"
                  />
                </span>
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

export default memo(ScheduleTypeModal);
