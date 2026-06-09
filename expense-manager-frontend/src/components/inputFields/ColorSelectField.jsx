import PropTypes from "prop-types";
import { useRef } from "react";

const ColorSelectField = ({
  data = [],
  className,
  label,
  value,
  onChange,
  inValid,
  errorMessage,
}) => {
  const colorRef = useRef(null);

  return (
    <div>
      {label && <span className="text-capitalize mb-2 d-block form-label">{label}</span>}
      <div className={className}>
        {data?.map((item, index) => {
          return (
            <span
              onClick={() => onChange(item)}
              className={`d-block br-10 cursor-pointer w-40px h-40px d-flex align-items-center justify-content-center`}
              key={index}
              style={{ backgroundColor: `${item}` }}
            >
              {value == item && (
                <i className="ri-check-line text-white fs-21"></i>
              )}
            </span>
          );
        })}
        <span
          onClick={() => colorRef.current.click()}
          className="d-block w-40px h-40px br-8 position-relative"
          style={{ backgroundColor: value }}
        >
          <input
            onChange={(e) => onChange(e.target.value)}
            ref={colorRef}
            type="color"
            className="w-0 h-0 border-none br-8 position-absolute"
            value={value}
          />
          <i className="ri-pencil-line position-absolute top-50 start-50 text-white translate-middle lh-0"></i>
        </span>
      </div>
      {inValid && (
        <span className="p-0 m-0 fs-12 text-color-invalid text-capitalize mt-1 d-block">
          {errorMessage}
        </span>
      )}
    </div>
  );
};

ColorSelectField.propTypes = {
  data: PropTypes.array,
  className: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  inValid: PropTypes.bool,
  errorMessage: PropTypes.string,
};

export default ColorSelectField;
