import PropTypes from "prop-types";
import { Image } from "../../data/images";
import { Link, useNavigate } from "react-router-dom";
import { CLIENT } from "../../constants/routes";
import { useSelector } from "react-redux";
import Goal from "./Goal";
import Financial from "./Financial";
import SavingGoals from "./SavingGoals";
import Budget from "./Budget";
import Help from "./Help";
import { reviewData } from "../../data/reviews";
import Currency from "./Currency";
import { Col } from "react-bootstrap";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getAccountThunk, verifyTokenThunk } from "../../store/actions";
import { logout } from "../../helpers/commonFunctions";
import Account from "./Account";
import { handleFirebaseEvent } from "../../firebase/config";
import { eventEnum } from "../../helpers/enum";
import { getCurrencyThunk } from "../../store/currency/thunk";

const Layout = () => {
  const { currentStep } = useSelector((store) => store.OnBoarding);
  const { token, user } = useSelector((store) => store.Auth);
  const { flatData } = useSelector((store) => store.Currency);
  const dispatch = useDispatch();

  handleFirebaseEvent(eventEnum.ONBOARDING_START);

  const stepperdata = [
    {
      component: <Goal title="What’s your primary financial goal?" />,
      img: "/images/onBoarding/onBoardingImg1.webp",
    },
    {
      component: (
        <Financial title="How do you manage your monthly income and expenses?" />
      ),
      title: "How do you manage your monthly income and expenses?",
      img: "/images/onBoarding/onBoardingImg2.webp",
    },
    {
      component: (
        <Currency
          title="select currency?"
          description="Select your preferred currency to view prices and complete transactions."
        />
      ),
      img: "/images/onBoarding/onBoardingImg2.webp",
    },
    {
      component: (
        <Account
          title="select account?"
          description="Select your preferred currency to view prices and complete transactions."
        />
      ),
      img: "/images/onBoarding/onBoardingImg2.webp",
    },
    {
      component: (
        <SavingGoals
          title="We'll help you save more effectively!"
          description="With WalletSync, you can set savings goals and track progress toward your financial milestones."
        />
      ),
      img: "/images/onBoarding/onBoardingImg3.webp",
    },
    {
      component: (
        <Budget
          title="Stay on top of your budget with ease"
          description="WalletSync helps you set and stick to a budget, keeping you informed when you’re close to overspending."
        />
      ),
      img: "/images/onBoarding/onBoardingImg4.webp",
    },
    {
      component: (
        <Help
          title="Here’s how WalletSync can help you:"
          description="WalletSync helps you set and stick to a budget, keeping you informed when you’re close to overspending."
        />
      ),
      img: "/images/onBoarding/onBoardingImg5.webp",
    },
  ];

  useEffect(() => {
    const tokenHandler = async () => {
      if (!user?._id && token) {
        const response = await dispatch(verifyTokenThunk({ token }));
        if (verifyTokenThunk.rejected.match(response)) {
          logout();
        }
      }
    };
    tokenHandler();
    dispatch(getAccountThunk());
    !flatData?.length && dispatch(getCurrencyThunk());
  }, []);

  return (
    <section>
      <div className="d-flex min-h-100vh responsive">
        <Col
          md={6}
          xl={45}
          className="onboarding-bg admin-primary-bg p-5 flex-column justify-content-between d-none d-lg-flex"
        >
          <Link to={CLIENT.HOME} className="h-50px d-block me-auto">
            <img src={Image.blackLogo} className="w-100 h-100" alt="" />
          </Link>
          <div className="my-4 d-flex flex-column align-items-center justify-content-between">
            <img
              src={stepperdata[currentStep].img}
              className="onboarding-img"
              alt=""
            />
          </div>
          <div className="d-flex align-items-center">
            <Col xs={4} className="">
              {/* <i className="ri-vip-crown-2-fill fs-24 text-color-gold common-box-shadow bg-white p-3 rounded-circle"></i> */}
              <img
                src={Image.premiumCrown}
                className="h-45px w-45px bg-white common-box-shadow p-2 rounded-circle object-fit-contain"
                alt=""
              />
              <h4 className="mt-4 fw-bold fs-32">3.2M+</h4>
              <p className="text-color-light-gray fs-16">
                Users have upgraded to our premium feature
              </p>
            </Col>
            <Col xs={8} className="pe-0">
              <div className="infiniteScrollReviewContainer">
                <div className="scroll">
                  {reviewData?.map((item, index) => {
                    const description = item?.description;
                    const name = item?.name;
                    const designation = item?.designation;
                    return (
                      <div
                        className="text-wrap item bg-white px-4 py-2 br-8"
                        key={index}
                      >
                        <i className="ri-double-quotes-l fs-28"></i>
                        <p className="text-color-light-gray truncate-line-3">{description}</p>
                        <div className="d-flex gap-2 align-items-center">
                          <img
                            src={Image.defaultUserImg}
                            className="w-35px h-35px"
                            alt=""
                          />
                          <span className="d-block">
                            <h6 className="fs-14 m-0 p-0 mb-1">{name}</h6>
                            <p className="fs-12 text-color-light-gray p-0 m-0">
                              {designation}
                            </p>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {reviewData?.map((item, index) => {
                    const description = item?.description;
                    const name = item?.name;
                    const designation = item?.designation;
                    return (
                      <div
                        className="text-wrap item bg-white px-4 py-2 br-8"
                        key={index}
                      >
                        <i className="ri-double-quotes-l fs-28"></i>
                        <p className="text-color-light-gray ">
                          {description + index}
                        </p>
                        <div className="d-flex gap-2 align-items-center">
                          <img
                            src={Image.defaultUserImg}
                            className="w-35px h-35px"
                            alt=""
                          />
                          <span className="d-block">
                            <h6 className="fs-14 m-0 p-0 mb-1">{name}</h6>
                            <p className="fs-12 text-color-light-gray p-0 m-0">
                              {designation}
                            </p>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="fade"></div>
              </div>
            </Col>
          </div>
        </Col>
        <Col
          xs={12}
          lg={6}
          xl={55}
          className="d-flex flex-column align-items-center justify-content-between"
        >
          {stepperdata[currentStep].component}
          {/* <div className="infiniteScrollReviewContainer mt-4 d-block d-lg-none">
              <div className="scroll">
                {reviewData?.map((item, index) => {
                  const description = item?.description;
                  const name = item?.name;
                  const designation = item?.designation;
                  return (
                    <div
                      className="text-wrap item bg-white px-4 py-2 br-8"
                      key={index}
                    >
                      <i className="ri-double-quotes-l fs-28"></i>
                      <p className="text-color-light-gray fs-13">
                        {description + index}
                      </p>
                      <div className="d-flex gap-2 align-items-center">
                        <img
                          src={Image.defaultUserImg}
                          className="w-35px h-35px"
                          alt=""
                        />
                        <span className="d-block">
                          <h6 className="fs-14 m-0 p-0 mb-1">{name}</h6>
                          <p className="fs-12 text-color-light-gray p-0 m-0">
                            {designation}
                          </p>
                        </span>
                      </div>
                    </div>
                  );
                })}
                {reviewData?.map((item, index) => {
                  const description = item?.description;
                  const name = item?.name;
                  const designation = item?.designation;
                  return (
                    <div
                      className="text-wrap item bg-white px-4 py-2 br-8"
                      key={index}
                    >
                      <i className="ri-double-quotes-l fs-28"></i>
                      <p className="text-color-light-gray fs-13">
                        {description + index}
                      </p>
                      <div className="d-flex gap-2 align-items-center">
                        <img
                          src={Image.defaultUserImg}
                          className="w-35px h-35px"
                          alt=""
                        />
                        <span className="d-block">
                          <h6 className="fs-14 m-0 p-0 mb-1">{name}</h6>
                          <p className="fs-12 text-color-light-gray p-0 m-0">
                            {designation}
                          </p>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="fade"></div>
            </div> */}
          {/* <div className="w-100 d-flex justify-content-between align-items-center py-3 px-3 px-sm-5 border-top common-border-color position-sticky bottom-0 bg-white">
            {currentStep > 0 ? (
              <Button
                onClick={() => {
                  dispatch(setCurrentStep(currentStep - 1));
                }}
                className="bg-transparent border-0 text-color-gray hover-text-color-primary fs-16 p-0"
              >
                <span>
                  <i className="ri-arrow-left-s-line fw-medium fs-18 me-2"></i>
                </span>
                Back
              </Button>
            ) : (
              <span></span>
            )}
            <Button
              onClick={() => {
                if (currentStep < stepperdata.length - 1) {
                  dispatch(setCurrentStep(currentStep + 1));
                }
                if (stepperdata[currentStep]?.data) {
                  handleStoreDatatoFirebase({
                    title: stepperdata[currentStep]?.title,
                    data: stepperdata[currentStep]?.data,
                  });
                }
              }}
              className={`${
                stepperdata[currentStep].isNext ? "" : "opacity-06"
              } primary-btn br-8 fs-14 py-2 v-fit`}
              disabled={!stepperdata[currentStep].isNext || loading}
            >
              {currentStep + 1 == stepperdata?.length ? "Get Started" : "Next"}
            </Button>
          </div> */}
        </Col>
      </div>
    </section>
  );
};

Layout.propTypes = {
  children: PropTypes.node,
};

export default Layout;
