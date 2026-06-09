const Stepper = ({ currentStep, title, description }) => {
  const stepLength = 7;
  return (
    <div className="">
      <div className="d-flex gap-2 ">
        {Array(stepLength)
          .fill("")
          ?.map((item, index) => {
            const isActive = index <= currentStep;
            return (
              <span
                key={index}
                className={`${
                  !isActive ? "bg-dark-white-color" : "bg-color-primary"
                } py-1 rounded-3 stepper-width d-block`}
              ></span>
            );
          })}
      </div>
      <span className="fw-medium d-block my-4 my-sm-5 fs-21">
        Step {currentStep + 1}
        <span
          className={`${currentStep + 1 !== 6 ? "text-color-light-gray" : ""}`}
        >
          /{stepLength}
        </span>
        <h1 className="fw-bold fs-36 text-capitalize mt-2">{title}</h1>
        {description && (
          <p className="text-color-light-gray fs-21 fw-normal mb-5">
            {description}
          </p>
        )}
      </span>
    </div>
  );
};

export default Stepper;
