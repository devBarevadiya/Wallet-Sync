import Lottie from "lottie-react";
import PropTypes from "prop-types";
import { Button, Col, Container } from "react-bootstrap";
import noPage from "/src/data/lottie/404.json";
import { useNavigate } from "react-router-dom";

const NoPage = ({
  animation = noPage,
  title = "Page Not Found !",
  message = "Oops! It seems like the page you're looking for doesn't exist. Please check the URL or navigate back to our homepage.",
}) => {
  const navigate = useNavigate();
  return (
    <div>
      <Container>
        <Col>
          <div className={`mt-3 display-message-page text-center`}>
            <Col xs={10} sm={6} md={5} xl={4} className={`mx-auto`}>
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
              <Button
                onClick={() => navigate(-1)}
                className="mt-4 btn border-0 m-0 responsive fs-16 bg-color-primary text-white w-100"
              >
                Back
              </Button>
            </Col>
          </div>
        </Col>
      </Container>
    </div>
  );
};

NoPage.propTypes = {
  animation: PropTypes.any,
  title: PropTypes.any,
  message: PropTypes.any,
};

export default NoPage;
