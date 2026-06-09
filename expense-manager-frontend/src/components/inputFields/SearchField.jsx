import { Form, FormControl } from "react-bootstrap";
import PropTypes from "prop-types";

const SearchField = ({
  groupClass,
  onClear,
  placeholder = "search transaction here...",
  value,
  ...props
}) => {
  return (
    <>
      <Form.Group className={groupClass}>
        <div
          className={` search-field d-flex align-items-center text-common-black position-relative common-border-color border admin-header-search-field w-100`}
        >
          <i className="ri-search-line fs-18 text-center"></i>
          <FormControl
            {...props}
            value={value}
            placeholder={placeholder}
            className="fs-14 text-common-black p-0 v-fit py-2 pe-5"
          />

          {value && (
            <i
              onClick={onClear}
              className="ri-close-fill fw-medium fs-18 cursor-pointer position-absolute top-50 translate-middle end-0 text-end"
            ></i>
          )}
        </div>
      </Form.Group>
    </>
  );
};

SearchField.propTypes = {
  groupClass: PropTypes.string,
  onClear: PropTypes.func,
  value: PropTypes.string,
  props: PropTypes.any,
  placeholder: PropTypes.string,
};

export default SearchField;
