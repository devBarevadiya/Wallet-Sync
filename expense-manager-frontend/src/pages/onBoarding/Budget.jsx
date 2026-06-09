import { useDispatch } from "react-redux";
import { Image } from "../../data/images";
import { useSelector } from "react-redux";
import { setCurrentStep } from "../../store/onBoarding/slice";
import { Button, Col } from "react-bootstrap";
import Stepper from "../../components/onBoarding/Stepper";

const Budget = ({ title, description }) => {
  const { currentStep } = useSelector((store) => store.OnBoarding);
  const dispatch = useDispatch();

  const handlePre = () => {
    dispatch(setCurrentStep(currentStep - 1));
  };

  const handleNext = () => {
    dispatch(setCurrentStep(currentStep + 1));
  };

  return (
    <div className="h-100 w-100">
      <div className="onboarding-children mx-auto h-100">
        <Stepper
          currentStep={currentStep}
          title={title}
          description={description}
        />
        <div className="w-75 mx-auto">
          <div
            data-aos="fade-up"
            className={`mx-auto position-relative z-1`}
          >
            <img
              src={Image.onBoardingBudget}
              alt="banner-section"
              className={`w-100 h-100 object-fit-cover`}
            />
          </div>
        </div>
      </div>
      <Col xs={12} lg={6} xl={55} className="position-fixed bottom-0 end-0">
        <div className="w-100 d-flex justify-content-between align-items-center py-3 px-3 px-sm-5 border-top common-border-color bg-white">
          <Button
            onClick={handlePre}
            className="bg-transparent border-0 text-color-gray hover-text-color-primary fs-18 p-0"
          >
            <span>
              <i className="ri-arrow-left-s-line fw-medium fs-18 me-2"></i>
            </span>
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="primary-btn v-fit fs-18 py-2 br-8 boarding-btn"
          >
            Next
          </Button>
        </div>
      </Col>
    </div>
  );
};

export default Budget;
