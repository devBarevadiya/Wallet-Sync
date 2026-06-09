import { memo, useCallback } from "react";
import ModelWrapper from "../../ModelWrapper";
import { Button, Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import { IconsImage } from "../../../data/images";
import { useModalScroll } from "../../../helpers/customHooks";

const AlertModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "No Accounts Found",
  description = "You have No any Account. Please add Account.",
  cancelBtnContent = "Cancel",
  confirmBtnContent = "Add Account",
}) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const modalBodyRef = useModalScroll({ scrollStep: 60, enabled: open });

  return (
    <Modal
      className="z-1200 modal-590px responsive"
      show={isOpen}
      onHide={onClose}
      centered={true}
    >
      <Modal.Body ref={modalBodyRef} className="text-center pb-1">
        <span className="min-w-100px w-100px aspect-square object-fit-cover mx-auto d-block">
          <img src={IconsImage.other.info} alt="info" />
        </span>
        <h5 className="fs-21 fw-semibold mb-1 mt-0 text-capitalize">{title}</h5>
        <span className="text-color-monsoon fs-16">{description}</span>
      </Modal.Body>
      <Modal.Footer>
        <div className="d-flex align-items-center gap-3 w-100">
          <Button className="w-100 light-gray-btn" onClick={handleClose}>
            {cancelBtnContent}
          </Button>
          <Button className="w-100 primary-btn" onClick={handleConfirm}>
            {confirmBtnContent}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

AlertModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  title: PropTypes.string,
  description: PropTypes.string,
  cancelBtnContent: PropTypes.string,
  confirmBtnContent: PropTypes.string,
};

export default memo(AlertModal);
