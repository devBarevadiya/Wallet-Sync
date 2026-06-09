import React from "react";
import PropTypes from "prop-types";

const DynamicLordIcon = ({
  coverClass = "bg-light",
  icon = "msoeawqm",
  title = "Oops ! No Data Yet !",
  subTitle = "You will have to add document to show here",
}) => {
  return (
    <React.Fragment>
      <div
        className={`py-4 w-100 h-100 d-flex align-items-center justify-content-center ${coverClass}`}
      >
        <div className="text-center">
          <div className="mb-1">
            <lord-icon
              src={`https://cdn.lordicon.com/${icon}.json`}
              trigger="loop"
              colors="primary:#222222,secondary:#b772ff"
              style={{
                width: "100px",
                height: "100px",
              }}
            ></lord-icon>
          </div>
          <h5>{title}</h5>
          <p className="text-muted">{subTitle}</p>
        </div>
      </div>
    </React.Fragment>
  );
};

DynamicLordIcon.propTypes = {
  coverClass: PropTypes.any,
  icon: PropTypes.any,
  title: PropTypes.any,
  subTitle: PropTypes.any,
};

export default DynamicLordIcon;
