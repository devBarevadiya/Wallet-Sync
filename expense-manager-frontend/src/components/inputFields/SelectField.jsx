import { Form } from "react-bootstrap";
import PropTypes from "prop-types";
import Select from "react-select";

const SelectField = ({
  multipleSelect = false,
  className = "mb-3 mb-md-4",
  formClass = "fs-16",
  label = "select option",
  invalid = false,
  children,
  errorMessage,
  type,
  initialValue,
  optional = false,
  ...props
}) => {
  if (type == "icon") {
    return (
      <Form.Group className={`${className}`}>
        {label && (
          <Form.Label className="text-capitalize fs-16">
            {label}
            {optional && (
              <span className="fs-12 ms-2 text-color-monsoon">(optional)</span>
            )}
          </Form.Label>
        )}
        <Form.Select
          {...props}
          className={`${
            invalid ? "border border-color-invalid" : "common-border-color"
          } text-common-black pe-5 responsive text-capitalize  ${formClass}`}
        >
          {children}
        </Form.Select>
        {invalid && errorMessage && (
          <span className="text-color-invalid fs-12 text-capitalize mt-1 d-block">
            {errorMessage}
          </span>
        )}
      </Form.Group>
    );
  } else if (multipleSelect) {
    let multipleValues = initialValue || [];
    children?.map((item) => {
      if (!item?.length > 0) {
        return (
          item?.value && multipleValues.push({ value: item?.props?.value })
        );
      }
      item?.map((item) => {
        return (
          item?.props?.value !== "" &&
          multipleValues.push({
            value: item?.props?.value,
            label: item?.props?.children,
          })
        );
      });
    });

    return (
      <>
        <Form.Group className={`${className}`}>
          {label && (
            <Form.Label className={`text-capitalize fs-16`}>
              {label}
              {optional && (
                <span className="fs-12 ms-2 text-color-monsoon">
                  (optional)
                </span>
              )}
            </Form.Label>
          )}
          <Select
            isMulti
            options={multipleValues}
            closeMenuOnSelect={false} // Keep dropdown open after selection
            {...props}
            classNamePrefix="input"
          />
          {invalid && errorMessage && (
            <span className="text-color-invalid fs-12 text-capitalize mt-1 d-block">
              {errorMessage}
            </span>
          )}
        </Form.Group>
      </>
    );
  } else {
    return (
      <Form.Group className={`${className}`}>
        {label && (
          <Form.Label className={`text-capitalize fs-16`}>
            {label}
            {optional && (
              <span className="fs-12 ms-2 text-color-monsoon">(optional)</span>
            )}
          </Form.Label>
        )}
        <Form.Select
          {...props}
          className={`${
            invalid ? "border border-color-invalid" : "common-border-color"
          } text-common-black pe-5 responsive text-capitalize ${formClass}`}
        >
          {children}
        </Form.Select>
        {invalid && errorMessage && (
          <span className="text-color-invalid fs-12 text-capitalize mt-1 d-block">
            {errorMessage}
          </span>
        )}
      </Form.Group>
    );
  }
};

SelectField.propTypes = {
  multipleSelect: PropTypes.bool,
  className: PropTypes.string,
  formClass: PropTypes.string,
  label: PropTypes.string,
  props: PropTypes.any,
  invalid: PropTypes.string,
  children: PropTypes.node,
  errorMessage: PropTypes.string,
  type: PropTypes.string,
  initialValue: PropTypes.any,
  defaultValue: PropTypes.any,
  optional: PropTypes.bool,
};

export default SelectField;
