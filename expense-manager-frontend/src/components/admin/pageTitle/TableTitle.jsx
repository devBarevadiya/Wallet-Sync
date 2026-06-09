import { memo } from "react";
import { Button } from "react-bootstrap";

const TableTitle = ({
  title,
  buttonContent,
  onClick,
  count,
  customBtn,
  className = "mt-3",
}) => {
  return (
    <div
      className={`${className} border rounded-top-4 bg-white common-border-color p-3 gap-2 d-flex align-items-center justify-content-between flex-wrap`}
    >
      <span className={`fs-5 fw-medium lh-base text-capitalize`}>
        {title}
        {count >= 0 ? (
          <span className="fs-14 client-section-bg-color py-2 px-3 br-18 ms-3">
            {count} {count > 1 ? "Records" : "Record"}
          </span>
        ) : (
          ""
        )}
      </span>
      <div className={`filters-div d-flex flex-wrap align-items-center gap-3`}>
        {customBtn && customBtn}
        {buttonContent && (
          <Button
            onClick={onClick}
            className="primary-white-btn order-1 order-sm-0 order-lg-1  v-fit py-1 br-8 hover-bg-color-primary hover-text-color-white hover-text-color-white-i text-dark-primary d-flex align-items-center justify-content-center border common-border-color px-3 gap-1 text-capitalize"
            // className="text-truncate primary-white-btn focus-bg-color-primary v-fit min-h-40px py-1 br-8 bg-white hover-bg-color-primary hover-text-color-white-i hover-text-color-white-span text-dark-primary d-flex align-items-center justify-content-center border common-border-color px-3 gap-0 text-capitalize"
          >
            <i className="transition ri-add-line fs-22 text-table-head-color"></i>
            <span className={`fs-15`}>{buttonContent}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default memo(TableTitle);
