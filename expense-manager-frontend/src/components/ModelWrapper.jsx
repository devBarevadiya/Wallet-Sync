import { Modal } from "react-bootstrap";
import PropTypes from "prop-types";
import { useMemo } from "react";

function ModelWrapper({
  size,
  centered = true,
  title,
  show,
  onHide,
  backButton = false,
  children,
  ...props
}) {
  return (
    <Modal
      show={show}
      size={size}
      centered={centered}
      onHide={onHide}
      {...props}
    >
      {useMemo(
        () => (
          <Modal.Header
            closeButton
            className="border-bottom common-border-color py-4"
          >
            <Modal.Title className="text-capitalize fs-21 responsive max-w-300px d-block text-truncate">
              {backButton ? (
                <i
                  onClick={onHide}
                  className="ri-arrow-left-line me-2 fs-24 cursor-pointer"
                ></i>
              ) : (
                ""
              )}
              {title}
            </Modal.Title>
          </Modal.Header>
        ),
        [title, backButton, onHide]
      )}
      {children}
    </Modal>
  );
}

ModelWrapper.propTypes = {
  size: PropTypes.string,
  centered: PropTypes.bool,
  title: PropTypes.string,
  show: PropTypes.any,
  onHide: PropTypes.any,
  backButton: PropTypes.bool,
  children: PropTypes.node,
  props: PropTypes.any,
};

export default ModelWrapper;
