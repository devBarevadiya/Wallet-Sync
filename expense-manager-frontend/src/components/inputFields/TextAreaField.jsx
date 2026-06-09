import { Form } from "react-bootstrap";
import PropTypes from "prop-types";

const TextAreaField = ({
  invalid,
  fieldClass,
  label = "description",
  rows = 4,
  errorMessage,
  optional = false,
  ...props
}) => {

  return (
    <>
      <Form.Group>
        <Form.Label className="text-capitalize fs-16">
          {label}
          {optional && (
            <span className="fs-12 ms-2 text-color-monsoon">(optional)</span>
          )}
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={rows}
          {...props}
          className={`${
            invalid ? "border border-color-invalid" : "common-border-color"
          } text-common-black pt-2 fs-16 responsive ${fieldClass}`}
        />
        {invalid && errorMessage && (
          <span className="text-color-invalid fs-12 text-capitalize mt-1 d-block">
            {errorMessage}
          </span>
        )}
      </Form.Group>
    </>
  );
};

TextAreaField.propTypes = {
  invalid: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  fieldClass: PropTypes.string,
  label: PropTypes.string,
  rows: PropTypes.number,
  props: PropTypes.any,
  errorMessage: PropTypes.any,
  optional: PropTypes.bool,
};

export default TextAreaField;
