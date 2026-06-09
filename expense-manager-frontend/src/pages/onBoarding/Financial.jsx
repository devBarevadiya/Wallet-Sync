import { Button, Col, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setCurrentStep, setFinancialData } from "../../store/onBoarding/slice";
import Stepper from "../../components/onBoarding/Stepper";
import { setDocThunk } from "../../store/onBoarding/thunk";

const Financial = ({ title }) => {
  const { currentStep, financialData, loading } = useSelector(
    (store) => store.OnBoarding
  );
  const { user } = useSelector((store) => store.Auth);
  const dispatch = useDispatch();

  const data = [
    {
      title: "I manually track everything",
    },
    {
      title: "I have no system but want to start",
    },
    {
      title: "I use a spreadsheet or app, but it’s not helping",
    },
    {
      title: "I’m inconsistent with tracking",
    },
  ];

  const handleChange = (title) => {
    const selectedData = financialData?.includes(title)
      ? financialData?.filter((item) => item !== title)
      : [...financialData, title];

    dispatch(setFinancialData(selectedData));
  };

  const handlePre = () => {
    dispatch(setCurrentStep(currentStep - 1));
  };

  const handleNext = () => {
    dispatch(
      setDocThunk({
        title,
        data: {
          answer: financialData,
          email: user?.email,
          question: title,
          userId: user?._id,
        },
      })
    );
    dispatch(setCurrentStep(currentStep + 1));
  };

  return (
    <div className="h-100">
      <div className="onboarding-children mx-auto h-100">
        <Stepper currentStep={currentStep} title={title} />
        <Row className="">
          {data.map((item, index) => {
            const title = item.title;
            return (
              <div key={index} className="pe-1 mb-3 w-fit cursor-pointer">
                <div
                  className={`${
                    financialData.includes(title)
                      ? "border-color-primary bg-color-light-primary"
                      : "common-border-color hover-on-boarding-card client-section-bg-color"
                  } border p-3 br-10`}
                  onClick={() => handleChange(title)}
                >
                  <span className="d-block fs-21">{title}</span>
                </div>
              </div>
            );
          })}
        </Row>
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
            disabled={loading || !financialData?.length > 0}
          >
            {loading ? "Loading..." : "Next"}
          </Button>
        </div>
      </Col>
    </div>
  );
};

export default Financial;
