import { memo, useCallback } from "react";
import { Button } from "react-bootstrap";
import { Image } from "../../data/images";
import PropTypes from "prop-types";

const NoData = ({
  onButtonClick,
  description = "Take control of your expenses and save more <br /> money with budgets!",
  title = "Setup your first budget",
  buttonContent = "Create New Budget",
  image = Image.noBudget,
  className = "mt-3 layout-content-without-table-height rounded-4",
}) => {
  const handleOpenModal = useCallback(() => {
    onButtonClick();
  }, [onButtonClick]);

  return (
    <>
      {" "}
      <div
        className={`${className} border common-border-color bg-white d-flex align-items-center justify-content-center invisible-scrollbar  responsive text-center mb-3`}
      >
        <div className="d-flex flex-column align-items-center justify-content-center">
          <img className="no-budget-img" src={image} alt="" />
          <h3 className="fs-24 fw-semibold">{title}</h3>
          <p
            className="text-color-monsoon fs-14 text-center max-w-370px"
            dangerouslySetInnerHTML={{ __html: description }}
          ></p>
          <Button
            className="primary-btn fs-14 mt-3 br-10"
            onClick={handleOpenModal}
          >
            {buttonContent}
          </Button>
        </div>
      </div>
    </>
  );
};

NoData.propTypes = {
  onButtonClick: PropTypes.func,
  description: PropTypes.string,
  title: PropTypes.string,
  buttonContent: PropTypes.string,
  image: PropTypes.string,
  className: PropTypes.string,
};

export default memo(NoData);
