import Lottie from "lottie-react";
import PropTypes from "prop-types";
import { Button, Col, Container } from "react-bootstrap";
import noRecord from "/src/data/lottie/noRecord.json";
import { useNavigate } from "react-router-dom";

const NoRecord = ({
  animation = noRecord,
  title = "record not found !",
  message = "We couldn't find any records matching your search criteria at the moment. Please try again later or refine your search to find what you're looking for.",
  isBack = true,
}) => {
  const navigate = useNavigate();
  return (
    <div>
      <Container>
        {/* <Col> */}
        <div className={`display-message-page text-center`}>
          <Col xs={10} sm={6} md={5} xl={3} className={`mx-auto`}>
            <Lottie className="w-100 mx-auto" animationData={animation} />
          </Col>
          <h3
            className={`mt-3 mt-md-4 mb-0 responsive text-color-primary fs-3 fw-medium text-capitalize`}
          >
            {title}
          </h3>
          <Col sm={10} md={8} xl={6} xxl={5} className={`mx-auto`}>
            <p
              className={`mt-2 mb-0 responsive text-color-secondary fs-14 fw-medium`}
            >
              {message}
            </p>
            {isBack ? (
              <Button
                onClick={() => navigate(-1)}
                className="mt-4 btn border-0 m-0 responsive fs-16 bg-color-primary text-white w-100"
              >
                Back
              </Button>
            ) : null}
          </Col>
        </div>
        {/* </Col> */}
      </Container>
    </div>
  );
};

NoRecord.propTypes = {
  animation: PropTypes.any,
  title: PropTypes.any,
  message: PropTypes.any,
  isBack: PropTypes.any,
};

export default NoRecord;
