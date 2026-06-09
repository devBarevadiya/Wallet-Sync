import { useSelector } from "react-redux";
import Stepper from "../../components/onBoarding/Stepper";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { setCurrentStep } from "../../store/onBoarding/slice";
import * as yup from "yup";
import { useFormik } from "formik";
import {
  getAccountThunk,
  getAccountTypeThunk,
  postAccountThunk,
} from "../../store/actions";
import InputField from "../../components/inputFields/InputField";
import SelectField from "../../components/inputFields/SelectField";
import { useEffect } from "react";
import { getCurrencyThunk } from "../../store/currency/thunk";
import { handleFirebaseEvent } from "../../firebase/config";
import { eventEnum } from "../../helpers/enum";

const Account = ({ title, description }) => {
  const { currentStep } = useSelector((store) => store.OnBoarding);
  const { data, flatData } = useSelector((store) => store.Currency);
  const { data: accountData } = useSelector((store) => store.AccountType);
  const { loading, data: accData } = useSelector((store) => store.Account);
  const { baseCurrency } = useSelector((store) => store.Auth);
  const dispatch = useDispatch();
  const userCurrency = baseCurrency?._id || baseCurrency?.currency;
  const initialValues = {
    title: "",
    balance: "",
    currency: userCurrency || "",
    accountType: accountData[0]?._id || "",
    color: "#FAF2FF",
    // isArchive: false,
  };

  const validationSchema = yup.object({
    title: yup.string().required(),
    balance: yup.number(),
    currency: yup.string().required("currency is required"),
    accountType: yup.string().required("accountType is required"),
    color: yup.string().required("color is required"),
  });

  const validation = useFormik({
    name: "add-edit-validation",
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      values.title = values.title.trim();
      if (!values.balance > 0) {
        values.balance = 0;
      }
      if (!accData?.length) {
        const response = await dispatch(postAccountThunk(values));
        if (postAccountThunk.fulfilled.match(response)) {
          handleFirebaseEvent(eventEnum.ONBOARDING_COMPLETED);
          const getResponse = await dispatch(getAccountThunk());
          if (getAccountThunk.fulfilled.match(getResponse)) {
            dispatch(setCurrentStep(currentStep + 1));
          }
        }
      }
    },
  });

  const handleSkip = async () => {
    const response = await dispatch(
      postAccountThunk({
        title: "Cash",
        balance: 0,
        currency: userCurrency || "",
        accountType: accountData[0]?._id || "",
        color: "#FAF2FF",
      })
    );
    if (postAccountThunk.fulfilled.match(response)) {
      handleFirebaseEvent(eventEnum.ONBOARDING_COMPLETED);
      const getResponse = await dispatch(getAccountThunk());
      if (getAccountThunk.fulfilled.match(getResponse)) {
        dispatch(setCurrentStep(currentStep + 1));
      }
    }
  };

  const handlePre = () => {
    dispatch(setCurrentStep(currentStep - 1));
  };

  const handleNext = () => {
    validation.handleSubmit();
  };

  useEffect(() => {
    if (!data?.length > 0) {
      dispatch(getCurrencyThunk());
    }
    if (!accountData?.length > 0) {
      dispatch(getAccountTypeThunk());
    }
  }, []);

  return (
    <div className="h-100 w-100">
      <div className="onboarding-children mx-auto h-100">
        <Stepper
          currentStep={currentStep}
          title={title}
          description={description}
        />
        <div>
          <Form onSubmit={validation.handleSubmit}>
            <Row className="px-1">
              <Col sm={6}>
                <InputField
                  name="title"
                  id="title"
                  label="name"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.title}
                  invalid={validation.touched.title && validation.errors.title}
                  errorMessage={validation.errors.title}
                  placeholder="Account name"
                />
              </Col>
              <Col sm={6}>
                <SelectField
                  name="currency"
                  id="currency"
                  label="currency"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.currency}
                  invalid={
                    validation.touched.currency && validation.errors.currency
                  }
                  errorMessage={validation.errors.currency}
                >
                  {flatData?.map((item, index) => {
                    return (
                      <option key={index} value={item?._id}>
                        {item?.code}
                      </option>
                    );
                  })}
                </SelectField>
              </Col>
              <Col xs={6}>
                <SelectField
                  name="accountType"
                  id="accountType"
                  label="account Type"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.accountType}
                  invalid={
                    validation.touched.accountType &&
                    validation.errors.accountType
                  }
                  errorMessage={validation.errors.accountType}
                >
                  {accountData?.map((item, index) => {
                    return (
                      <option key={index} value={item?._id}>
                        {item?.title}
                      </option>
                    );
                  })}
                </SelectField>
              </Col>
              <Col sm={6}>
                <InputField
                  label="initial amount"
                  type="number"
                  name="balance"
                  id="balance"
                  placeholder="0"
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.balance}
                  invalid={
                    validation.touched.balance && validation.errors.balance
                  }
                  errorMessage={validation.errors.balance}
                />
              </Col>
              <span
                className="d-block text-end text-color-primary cursor-pointer"
                onClick={handleSkip}
              >
                Skip <i className="ri-arrow-right-double-line"></i>
              </span>
            </Row>
            <Col
              xs={12}
              lg={6}
              xl={55}
              className="position-fixed bottom-0 end-0"
            >
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
                  disabled={loading || accData?.length}
                  type="submit"
                  onClick={handleNext}
                  className="primary-btn v-fit fs-18 py-2 br-8 boarding-btn "
                >
                  {loading ? "Loading..." : "Next"}
                </Button>
              </div>
            </Col>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Account;
