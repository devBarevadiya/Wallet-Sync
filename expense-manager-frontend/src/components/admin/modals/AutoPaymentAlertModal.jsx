import { memo, useState } from "react";
import ModelWrapper from "../../ModelWrapper";
import { Button, Form, Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useModalScroll } from "../../../helpers/customHooks";

const AutoPaymentAlertModal = ({ onHide, isOpen, onSubmit }) => {
  const [isChecked, setIsChecked] = useState();
  const { loading } = useSelector((store) => store.Stripe);

  const handleClose = () => {
    setIsChecked(false);
    onHide();
  };

  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  return (
    <ModelWrapper
      show={isOpen}
      onHide={handleClose}
      title={"Auto payment alert"}
      className="modal-650px"
    >
      <Modal.Body ref={modalBodyRef}>
        Clicking the "Auto Pay" button will securely process your autopay using
        the card details you provided. Your payment will be handled through
        Stripe's trusted platform, ensuring safety and convenience. Once
        submitted, the payment will be processed instantly.
        <Form.Group className="d-flex align-items-center  mt-3">
          <Form.Check
            //   checked={selectedId.includes(item?._id)}
            onChange={() => setIsChecked(!isChecked)}
            className="square-check text-color-light-gray fs-18"
            type={"checkbox"}
            id="autoPayCheckbox"
            //   id={index1}
            //   disabled={!checkPermission}
            // label={`select all account`}
            checked={isChecked}
            // onChange={handleAccountCheckbox}
          />
          <label
            htmlFor="autoPayCheckbox"
            className="ms-2 cursor-pointer user-select-none"
          >
            I agree to use the card previously provided for{" "}
            <strong>autopay</strong>
          </label>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer className="pt-0">
        <div className="d-flex w-100 gap-3">
          <Button onClick={onHide} className="light-gray-btn w-100">
            Cancel
          </Button>
          <Button
            className="primary-btn w-100"
            onClick={onSubmit}
            disabled={!isChecked || loading}
          >
            {loading ? "Loading..." : "Auto pay"}
          </Button>
        </div>
      </Modal.Footer>
    </ModelWrapper>
  );
};

export default memo(AutoPaymentAlertModal);
