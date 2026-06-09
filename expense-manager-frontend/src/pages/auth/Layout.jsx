import PropTypes from "prop-types";
import { Col } from "react-bootstrap";
import { Image } from "../../data/images";
import { Link } from "react-router-dom";
import { CLIENT } from "../../constants/routes";

const Layout = ({
  children,
  title = "Login",
  description = "Welcome to the WalletSync!",
}) => {
  return (
    <main className="bg-color-primary d-flex align-items-center justify-content-center">
      <div className="w-100">
        <Col xs={12} className="mx-auto admin-primary-bg br-5 shadow-1 p-0">
          <div className="align-items- min-h-100vh p-0 d-flex w-100 invisible-scrollbar">
            <Col
              lg={6}
              xl={7}
              className="gradient-bg-1 p-0 min-h-100vh d-none d-lg-flex align-items-center justify-content-center flex-column p-5 pb-0 position-relative invisible-scrollbar"
            >
              <Link to={CLIENT.HOME}>
                <img
                  className="me-auto white-logo position-absolute top-0 start-0 m-5"
                  src={Image.whiteLogo}
                  alt="white-logo"
                />
              </Link>
              <img
                loading="lazy"
                className="col-12 col-xl-10 aspect-test mt-4"
                src={Image.authImg}
                alt="auth-img"
              />
              <h2 className="text-white fw-bold text-center">
                The easiest way to manage <br /> your wallet
              </h2>
              <p className="text-white fw-light opacity-75 mt-2">
                Join the WalletSync community now!
              </p>
            </Col>
            <Col
              xs={12}
              lg={6}
              xl={5}
              className="p-0 d-flex align-items-center"
            >
              <div className="auth-form-width mx-auto py-3 pb-4 px-20px">
                <div className="mb-4 pb-1">
                  <h1 className="fw-semibold fs-28 text-capitalize">{title}</h1>
                  <p className="text-color-gray fw-medium">{description}</p>
                </div>
                {children}
              </div>
            </Col>
          </div>
        </Col>
      </div>
    </main>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
};

export default Layout;
