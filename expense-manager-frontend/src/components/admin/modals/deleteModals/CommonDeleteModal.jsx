import { Button, Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import { IconsImage } from "../../../../data/images";
import { memo, useCallback } from "react";

const CommonDeleteModal = ({
  isOpen,
  onClose,
  backdropClassName,
  content = {},
  onConfirm,
  loading,
  loadingContent,
  icon,
}) => {
  const {
    title = "Are you sure you want to Delete?",
    description,
    confirmText = "Yes",
    cancelText = "Not Now",
    customDescription = "",
  } = content;

  const handleConfirm = useCallback(async () => {
    await onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  return (
    <Modal
      className="z-1200 modal-590px responsive"
      show={isOpen}
      onHide={onClose}
      backdropClassName={backdropClassName}
      centered={true}
    >
      <Modal.Body>
        <div className="text-center">
          <span className="min-w-100px w-100px aspect-square object-fit-cover mx-auto d-block">
            <img
              className="mx-auto d-block"
              src={icon || IconsImage.other.info}
              alt="info"
            />
          </span>
          <h5 className="fs-19 fw-semibold mt-0 mb-1">{title}</h5>
          {description && <p className="fs-16">{description}</p>}
          {customDescription && (
            <p
              className="fs-16"
              dangerouslySetInnerHTML={{ __html: customDescription }}
            ></p>
          )}
          <div className="d-flex gap-3 mt-4">
            <Button className="light-gray-btn w-100" onClick={onClose}>
              {cancelText}
            </Button>
            <Button
              disabled={loading}
              className="primary-btn w-100"
              onClick={handleConfirm}
            >
              {loading ? loadingContent || "Deleting..." : confirmText}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

CommonDeleteModal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  backdropClassName: PropTypes.string,
  content: PropTypes.object,
  onConfirm: PropTypes.func,
  loading: PropTypes.bool,
  loadingContent: PropTypes.bool,
  icon: PropTypes.bool,
};

export default memo(CommonDeleteModal);
