import { Button, Modal } from "react-bootstrap";
import ModelWrapper from "../../../ModelWrapper";
import Calendar from "react-calendar/dist/cjs/Calendar.js";
import { memo, useCallback, useState } from "react";
import PropTypes from "prop-types";

const CustomCalanderModal = ({
  isOpen,
  onClose,
  title = "Select Date",
  onSelectValue,
  buttonContent = "",
  onClickButton,
  loading = false,
  minDate = "",
  maxDate = "",
}) => {
  const [date, setDate] = useState("");

  const handleCloseModal = useCallback((date) => {
    setDate(date);
    onSelectValue(date);
    // onClose();
  }, [onSelectValue]);

  return (
    <ModelWrapper
      show={isOpen}
      onHide={onClose}
      className="modal-650px responsive"
      title={title}
    >
      <Modal.Body>
        <Calendar
          onChange={handleCloseModal}
          value={date}
          minDate={minDate}
          maxDate={maxDate}
        />
      </Modal.Body>
      {buttonContent && (
        <Modal.Footer className="pt-0">
          <Button
            disabled={loading}
            className="primary-btn w-100 fs-16"
            onClick={() => onClickButton(date)}
          >
            {buttonContent}
          </Button>
        </Modal.Footer>
      )}
    </ModelWrapper>
  );
};

CustomCalanderModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  onSelectValue: PropTypes.func,
  isButton: PropTypes.bool,
  buttonContent: PropTypes.string,
  onClickButton: PropTypes.func,
  loading: PropTypes.bool,
  minDate: PropTypes.any,
  maxDate: PropTypes.any,
};

export default memo(CustomCalanderModal);
