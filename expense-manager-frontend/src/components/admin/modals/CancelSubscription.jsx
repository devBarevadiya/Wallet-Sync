import { Button, Modal } from "react-bootstrap";
import ModelWrapper from "../../ModelWrapper";
import { useSelector } from "react-redux";
import { memo } from "react";
import { useModalScroll } from "../../../helpers/customHooks";

const CancelSubscription = ({ isOpen, onClose, onSubmit }) => {
  const { loading } = useSelector((store) => store.Stripe);

  const data = [
    "By canceling your subscription, you will stop the auto-renewal of your current plan.",
    "Your current plan or trial will remain active until the expiration date",
    " You will not be charged for the next billing cycle.",
  ];

  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  return (
    <ModelWrapper
      show={isOpen}
      onHide={onClose}
      title={"Subscription cacellation"}
      className="modal-650px"
    >
      <Modal.Body ref={modalBodyRef}>
        <ul className="p-0 m-0 d-flex flex-column gap-2 ">
          {data?.map((item, index) => {
            return (
              <li
                key={index}
                className="d-flex align-items-start gap-3 text-color-monsoon"
              >
                <span className="p-1 bg-dark rounded-circle mt-2"></span>
                {item}
              </li>
            );
          })}
        </ul>
      </Modal.Body>
      <Modal.Footer className="pt-0">
        <div className="d-flex w-100 gap-3">
          <Button onClick={onClose} className="light-gray-btn w-100">
            Cancel
          </Button>
          <Button
            className="primary-btn w-100"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? "Loading..." : "Confirm"}
          </Button>
        </div>
      </Modal.Footer>
    </ModelWrapper>
  );
};

export default memo(CancelSubscription);
