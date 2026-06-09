import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setCurrentStep } from "../../store/onBoarding/slice";
import { Button, Col } from "react-bootstrap";
import Stepper from "../../components/onBoarding/Stepper";
import { useNavigate } from "react-router-dom";
import { ADMIN, ON_BOARDING } from "../../constants/routes";
import { setIsSubScriptionScreen } from "../../store/filters/slice";

const Help = ({ title, description }) => {
  const { currentStep } = useSelector((store) => store.OnBoarding);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const data = [
    "Save smarter with personalized goals",
    "Track every expense in one place",
    "Stay within your budget with notifications and insights",
    "See your progress with clear financial reports",
  ];

  const handlePre = () => {
    dispatch(setCurrentStep(currentStep - 1));
  };

  const handleNext = () => {
    dispatch(setIsSubScriptionScreen(false));
    nav(ADMIN.DASHBOARD.PATH);
  };

  return (
    <div className="h-100 w-100">
      <div className="onboarding-children mx-auto h-100">
        <Stepper
          currentStep={currentStep}
          title={title}
          description={description}
        />
        <ul className="m-0 p-0">
          {data.map((item, index) => {
            return (
              <li
                key={index}
                className="d-flex align-items-center gap-2 fs-16 mb-2"
              >
                <span className="h-20px w-20px bg-color-primary d-flex align-items-center text-color-gray justify-content-center rounded-circle">
                  <i className="ri-check-line text-white fw-bold fs-14 lh-0"></i>
                </span>
                {item}
              </li>
            );
          })}
        </ul>
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
            Get started
          </Button>
        </div>
      </Col>
    </div>
  );
};

export default Help;
