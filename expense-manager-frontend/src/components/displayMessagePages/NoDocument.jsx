import Lottie from "lottie-react";
import PropTypes from "prop-types";
import { Button, Col, Container } from "react-bootstrap";
import noDocument from "/src/data/lottie/noDocument.json";
import { useNavigate } from "react-router-dom";

const NoDocument = ({
  animation = noDocument,
  title = "Stay Tuned! Blogs Coming Soon",
  message = "Currently, there are no blogs to display. Check back soon to explore our latest content here!",
  isBack = true,
}) => {
  const navigate = useNavigate();
  return (
    <div>
      <Container>
        {/* <Col> */}
        <div className={`display-message-page text-center`}>
          <Col sm={8} md={8} lg={7} xl={6} className={`mx-auto`}>
            <Lottie className="w-100 mx-auto" animationData={animation} />
          </Col>
          <h3
            className={`mt-3 mt-md-4 mb-0 responsive text-color-primary fs-3 fw-medium text-capitalize`}
          >
            {title}
          </h3>
          <Col sm={10} md={8} xl={6} xxl={5} className={`mx-auto`}>
            <p
              className={`mt-2 mb-0 responsive text-color-gray fs-14 fw-medium`}
            >
              {message}
            </p>
            {isBack ? (
              <Button
                onClick={() => navigate(-1)}
                className="mt-4 btn border-0 m-0 responsive fs-17 primary-btn v-fit py-2 br-8 text-capitalize"
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

NoDocument.propTypes = {
  animation: PropTypes.any,
  title: PropTypes.any,
  message: PropTypes.any,
  isBack: PropTypes.any,
};

export default NoDocument;
