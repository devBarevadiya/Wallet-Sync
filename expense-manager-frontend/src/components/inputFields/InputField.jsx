import { Form } from "react-bootstrap";
import PropTypes from "prop-types";
import { useState } from "react";

const InputField = ({
  label = "email address",
  className = "mb-3 mb-md-4",
  fieldClass = "",
  invalid = false,
  type = "text",
  preIcon = "",
  postIcon = "",
  errorMessage,
  isLable = true,
  optional = false,
  onInput,
  inputMode = "text",
  ...props
}) => {
  const isPreIcon = Object.keys(preIcon)?.length > 0 || preIcon || false;
  const isPostIcon = Object.keys(postIcon)?.length > 0 || postIcon || false;

  const handleInput = (e) => {
    const sanitizedValue = e.target.value.replace(/[^0-9.]/g, ""); // Remove any non-numeric characters
    e.target.value = sanitizedValue;
    onInput && onInput();
  };

  const [showPassword, setShowPassword] = useState(false);
  if (type === "password") {
    return (
      <>
        <Form.Group className={`${className}`}>
          {isLable && label && (
            <Form.Label className="text-capitalize fs-16">{label}</Form.Label>
          )}
          <div className="position-relative">
            <Form.Control
              {...props}
              onInput={onInput}
              inputMode={inputMode}
              type={showPassword ? "string" : type}
              className={`${
                invalid ? "border border-color-invalid" : "common-border-color"
              } text-common-black pe-5 fs-16 responsive`}
            />
            <button
              className="transition-none btn btn-link position-absolute end-0 top-50 translate-middle-y text-decoration-none text-common-black"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="show-hide-password"
            >
              <i
                className={`${
                  showPassword ? `ri-eye-off-line` : `ri-eye-line`
                } align-middle fs-5 fw-bold`}
              ></i>
            </button>
          </div>
          {invalid && errorMessage && (
            <span className="text-color-invalid fs-12 text-capitalize mt-1 d-block">
              {errorMessage}
            </span>
          )}
        </Form.Group>
      </>
    );
  } else if (type == "clickOnly") {
    return (
      <div className="mb-3 text-break">
        {/* <span className="text-capitalize fs-16 d-block mb-2">{label}</span> */}
        {isLable && <Form.Label className="text-capitalize fs-16 ">{label}</Form.Label>}
        <span
          {...props}
          onInput={onInput}
          inputMode={inputMode}
          className={`border ${
            invalid ? "border-color-invalid" : "common-border-color"
          } br-10 d-block w-100  cursor-pointer d-flex align-items-center form-control`}
        >
          {props?.title || props.value || ""}
          {isPostIcon && <span className="ms-auto ps-3">{postIcon}</span>}
        </span>
        {invalid && errorMessage && (
          <span className="text-color-invalid fs-12 text-capitalize mt-1 d-block">
            {errorMessage}
          </span>
        )}
      </div>
    );
  } else if (inputMode == "numeric") {
    return (
      <>
        <Form.Group className={`${className} `}>
          {isLable && label && (
            <Form.Label className="text-capitalize fs-16">
              {label}
              {optional && (
                <span className="fs-12 ms-2 text-color-monsoon">
                  (optional)
                </span>
              )}
            </Form.Label>
          )}
          <span className={`position-relative d-block`}>
            <Form.Control
              type={type}
              onInput={handleInput}
              inputMode={inputMode}
              maxLength={12}
              {...props}
              className={`${
                invalid ? "border border-color-invalid" : "common-border-color"
              } text-common-black  fs-16 responsive ${fieldClass}`}
            />
            {isPreIcon && (
              <span className="position-absolute top-50 ps-5 translate-middle">
                {preIcon}
              </span>
            )}
            {isPostIcon && (
              <span className="position-absolute top-50 end-0 pe-1 fs-18 translate-middle">
                {postIcon}
              </span>
            )}
          </span>
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
      <>
        <Form.Group className={`${className} `}>
          {isLable && label && (
            <Form.Label className="text-capitalize fs-16">
              {label}
              {optional && (
                <span className="fs-12 ms-2 text-color-monsoon">
                  (optional)
                </span>
              )}
            </Form.Label>
          )}
          <span className={`position-relative d-block`}>
            <Form.Control
              type={type}
              onInput={onInput}
              inputMode={inputMode}
              {...props}
              className={`${
                invalid ? "border border-color-invalid" : "common-border-color"
              } text-common-black  fs-16 responsive ${fieldClass}`}
            />
            {isPreIcon && (
              <span className="position-absolute top-50 ps-5 translate-middle">
                {preIcon}
              </span>
            )}
            {isPostIcon && (
              <span className="position-absolute top-50 end-0 pe-1 fs-18 translate-middle">
                {postIcon}
              </span>
            )}
          </span>
          {invalid && errorMessage && (
            <span className="text-color-invalid fs-12 text-capitalize mt-1 d-block">
              {errorMessage}
            </span>
          )}
        </Form.Group>
      </>
    );
  }
};

InputField.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
  invalid: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  type: PropTypes.string,
  errorMessage: PropTypes.string,
  title: PropTypes.string,
  fieldClass: PropTypes.string,
  preIcon: PropTypes.any,
  isLable: PropTypes.bool,
  postIcon: PropTypes.any,
  value: PropTypes.any,
  props: PropTypes.any,
  optional: PropTypes.bool,
  onInput: PropTypes.func,
  inputMode: PropTypes.string,
};

export default InputField;
