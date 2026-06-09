import { Button, Col, Row } from "react-bootstrap";
import { useState } from "react";
import { useSelector } from "react-redux";
import { setCurrentStep, setGoalData } from "../../store/onBoarding/slice";
import { useDispatch } from "react-redux";
import Stepper from "../../components/onBoarding/Stepper";
import { setDocThunk } from "../../store/onBoarding/thunk";
import Reviews from "../../components/onBoarding/Reviews";

const Goal = ({ title }) => {
  const { currentStep, goalData, loading } = useSelector(
    (store) => store.OnBoarding
  );
  const { user } = useSelector((store) => store.Auth);
  const dispatch = useDispatch();

  const data = [
    {
      title: "Save for something important",
    },
    {
      title: "Track my expenses better",
    },
    {
      title: "Stay with in my budget",
    },
    {
      title: "Pay off debt",
    },
  ];

  const handleChange = (title) => {
    const selectedData = goalData?.includes(title)
      ? goalData?.filter((item) => item !== title)
      : [...goalData, title];

    dispatch(setGoalData(selectedData));
  };

  const handleNext = () => {
    dispatch(
      setDocThunk({
        title,
        data: {
          answer: goalData,
          email: user?.email,
          question: title,
          userId: user?._id,
        },
      })
    );
    dispatch(setCurrentStep(currentStep + 1));
  };

  return (
    <div className="h-100 w-100">
      <div className="onboarding-children mx-auto h-100">
        <Stepper currentStep={currentStep} title={title} />
        <Row>
          {data.map((item, index) => {
            const title = item.title;
            return (
              <Col md={6} key={index} className="pe-md-1 mb-3">
                <div
                  className={`${
                    goalData.includes(title)
                      ? "border-color-primary  bg-color-light-primary"
                      : "common-border-color hover-on-boarding-card client-section-bg-color"
                  } border p-3 p-sm-3 br-10 cursor-pointer d-flex d-md-block align-items-center gap-3`}
                  onClick={() => handleChange(title)}
                >
                  {/* <i className="ri-money-dollar-circle-line fs-36 mb-md-3 d-block"></i> */}
                  <img
                    src={`/images/onBoarding/goal${index + 1}.webp`}
                    className="goal-images"
                    alt=""
                  />
                  <span className="d-block fs-21 fw-medium">{title}</span>
                </div>
              </Col>
            );
          })}
        </Row>

        <div>
            {/* <Reviews /> */}
          <div className="w-100">
          </div>
        </div>
      </div>
      <Col xs={12} lg={6} xl={55} className="position-fixed bottom-0 end-0">
        <div className="w-100 d-flex justify-content-between align-items-center py-3 px-3 px-sm-5 border-top common-border-color bg-white">
          <span></span>
          <Button
            onClick={handleNext}
            className="primary-btn v-fit fs-18 br-8 boarding-btn"
            disabled={!user?._id || loading || !goalData?.length > 0}
          >
            {loading ? "Loading..." : "Next"}
          </Button>
        </div>
      </Col>
    </div>
  );
};

export default Goal;
