import PropTypes from "prop-types";
import { Button, Col, Container } from "react-bootstrap";
import internalServer from "/assets/web/display-message/internalServer.webp";
import { useNavigate } from "react-router-dom";

const InternalServer = ({
  image = internalServer,
  title = "Internal Server Error !",
  message = "Uh oh! Something went wrong on our end. Our team has been notified, and we're working to fix it as soon as possible. We apologize for the inconvenience.",
}) => {
  const navigate = useNavigate();
  return (
    <div>
      <Container>
        <Col>
          <div className={`display-message-page text-center`}>
            <Col xs={10} sm={6} md={5} xl={4} className={`mx-auto`}>
              <img className={`w-100`} src={image} alt={title} />
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

InternalServer.propTypes = {
  image: PropTypes.any,
  title: PropTypes.any,
  message: PropTypes.any,
};

export default InternalServer;
