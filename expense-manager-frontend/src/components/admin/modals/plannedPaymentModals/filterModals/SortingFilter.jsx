import ModelWrapper from "../../../../ModelWrapper";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Form, Modal } from "react-bootstrap";
import { useModalScroll } from "../../../../../helpers/customHooks";

const SortingFilter = ({
  isOpen,
  onClose,
  filterKey,
  dispatchFunc,
  filterData,
}) => {
  const [checked, setChecked] = useState(filterData || []);

  const dispatch = useDispatch();

  const handleSelect = useCallback(
    (value) => {
      dispatch(dispatchFunc({ [filterKey]: value }));
    },
    [dispatchFunc, dispatch, filterKey]
  );

  const closeModal = useCallback(() => {
    // handleSelect();
    onClose();
    setChecked(filterData);
  }, [onClose, filterData]);

  const handleCheck = (value) => {
    if (JSON.stringify(checked) == JSON.stringify(value)) {
      setChecked("");
      // handleSelect("");
    } else {
      setChecked(value);
      // handleSelect(value);
    }
  };

  const data = [
    {
      title: "By due date - oldest",
      value: { scheduleDate: -1 },
    },
    {
      title: "By due date - newest",
      value: { scheduleDate: 1 },
    },
    {
      title: "By name A to Z",
      value: { title: 1 },
    },
    {
      title: "By name Z to A",
      value: { title: -1 },
    },
  ];

  const handleApply = useCallback(() => {
    handleSelect(checked);
    onClose();
  }, [checked, onClose, handleSelect]);

  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  return (
    <ModelWrapper
      show={isOpen}
      onHide={closeModal}
      className="modal-650px responsive"
      title={`sorting`}
      backButton
    >
      <Modal.Body ref={modalBodyRef}>
        <ul className="m-0 p-0 d-flex flex-column gap-3">
          {data?.map((item, index) => {
            const title = item?.title;
            const value = item?.value;
            return (
              <li
                onClick={() => handleCheck(value)}
                key={index}
                className={`d-flex align-items-center justify-content-between text-capitalize border-bottom border-dark-white-color pb-3 cursor-pointer`}
              >
                <span className="text-capitalize p-0 m-0">{title}</span>
                <Form.Check
                  onChange={() => handleCheck(value)}
                  checked={JSON.stringify(value) == JSON.stringify(checked)}
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

export default SortingFilter;
