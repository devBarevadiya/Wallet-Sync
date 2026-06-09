import { Modal } from "react-bootstrap";
import PropTypes from "prop-types";

function ModelWrapper({
  size,
  centered = true,
  title,
  show,
  onHide,
  children,
  ...props
}) {
  return (
    <Modal
      className="modal-max-w-600px"
      show={show}
      size={size}
      centered={centered}
      onHide={onHide}
      {...props}
    >
      <Modal.Header
        className="px-4 pb-3 border-bottom common-border-color"
        closeButton
      >
        <Modal.Title className="text-capitalize fs-21 responsive">
          {title}
        </Modal.Title>
      </Modal.Header>
      {children}
    </Modal>
  );
}

ModelWrapper.propTypes = {
  size: PropTypes.string,
  centered: PropTypes.bool,
  title: PropTypes.string,
  show: PropTypes.bool,
  onHide: PropTypes.func,
  children: PropTypes.node,
  props: PropTypes.any,
};

export default ModelWrapper;
