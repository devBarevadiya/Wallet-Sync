import Layout from "../auth/Layout";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import { Button, Col, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { ADMIN, AUTH } from "../../constants/routes";
import SelectField from "../../components/inputFields/SelectField";
import { useEffect } from "react";
import {
  getCurrencyByCountryThunk,
  getCurrencyThunk,
} from "../../store/currency/thunk";
import { changeBaseCurrencyThunk, verifyTokenThunk } from "../../store/actions";
import Stepper from "../../components/onBoarding/Stepper";
import { setCurrentStep } from "../../store/onBoarding/slice";

const Currency = ({ title, description }) => {
  const dispatch = useDispatch();
  const { data, loading, flatData } = useSelector((store) => store.Currency);
  const { loading: accLoading, data: accData } = useSelector(
    (store) => store.Account
  );
  const { currentStep } = useSelector((store) => store.OnBoarding);
  const { token, currencyLoading } = useSelector((store) => store.Auth);
  // useEffect(() => {
  //   dispatch(signInThunk({ email: "yash@gmail.com", password: "123456789" }));
  // }, [dispatch]);

  const initialValues = {
    currency: "",
  };

  const validationSchema = yup.object({
    currency: yup.string().required("currency is required"),
  });

  const validation = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      const response = await dispatch(
        changeBaseCurrencyThunk({ currency: values.currency })
      );
      if (changeBaseCurrencyThunk.fulfilled.match(response)) {
        if (token) {
          const response = await dispatch(verifyTokenThunk({ token }));
          if (verifyTokenThunk.fulfilled.match(response)) {
            // nav(ADMIN.DASHBOARD.PATH);
            accData?.length > 0
              ? dispatch(setCurrentStep(currentStep + 2))
              : dispatch(setCurrentStep(currentStep + 1));
          }
        }
      }
      resetForm();
    },
  });

  // const getCurrencyCode = () => {
  //   const locale = navigator.language || "en-US";
  //   const currencyCode = new Intl.NumberFormat(locale, {
  //     style: "currency",
  //     currencyDisplay: "symbole",
  //   }).resolvedOptions().currency;

  // };
  // getCurrencyCode()

  const handlePre = () => {
    dispatch(setCurrentStep(currentStep - 1));
  };

  const handleNext = () => {
    validation.handleSubmit();
  };

  useEffect(() => {
    const fetch = async () => {
      const response = await dispatch(getCurrencyByCountryThunk());
      if (getCurrencyByCountryThunk.fulfilled.match(response)) {
        const currencyCode = response.payload.currency.code;
        const [filterData] =
          flatData?.filter((item) => item?.code == currencyCode) || [];

        validation.setFieldValue("currency", filterData?._id);
      }
    };
    fetch();
  }, [flatData]);

  useEffect(() => {
    !flatData?.length && dispatch(getCurrencyThunk());
  }, []);

  return (
    <div className=" w-100">
      <div className="onboarding-children mx-auto">
        <Stepper
          currentStep={currentStep}
          title={title}
          description={description}
        />

        <Form
          onSubmit={validation.handleSubmit}
          className="col-12 col-md-6 col-lg-12 col-xl-6"
        >
          {/* <Form.Group>
          <Form.Select
            id="currency"
            label="select currency"
            className="mb-3 hover-on-boarding-card client-section-bg-color fs-18"
            name="currency"
            onChange={validation.handleChange}
            onBlur={validation.handleBlur}
            value={validation.values.currency}
          >
            <option value="">Select Currency</option>
            {data.map((ele) => {
              return ele?.items?.map((item, index) => {
                return (
                  <option value={item?._id} key={index}>
                    {item?.currency}
                  </option>
                );
              });
            })}
          </Form.Select>  
        </Form.Group> */}
          <span className="position-relative d-block">
            <SelectField
              disabled={loading}
              id="currency"
              label=""
              formClass={`${
                loading ? "opacity-50" : ""
              } mb-1 hover-on-boarding-card client-section-bg-color fs-18`}
              name="currency"
              onChange={validation.handleChange}
              onBlur={validation.handleBlur}
              value={validation.values.currency}
              invalid={
                validation.touched.currency && validation.errors.currency
              }
              errorMessage={validation.errors.currency}
            >
              <option value="">select currency</option>
              {data.map((ele) => {
                return ele?.items?.map((item, index) => {
                  return (
                    <option value={item?._id} key={index}>
                      {item?.currency}
                    </option>
                  );
                });
              })}
            </SelectField>

            {loading && (
              <span className="position-absolute top-50 start-50 mt-1 translate-middle">
                {/* <img className="h-45px w-45px" src="/loader.gif" alt="" /> */}
                <span className="spin-loader"></span>
              </span>
            )}
          </span>
          {/* <Button type="submit" className="primary-btn w-100" disabled={loading}>
          {loading ? "Loading..." : "Submit"}
        </Button> */}
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
                disabled={loading || accLoading || currencyLoading}
                type="submit"
                onClick={handleNext}
                className="primary-btn v-fit fs-18 py-2 br-8 boarding-btn"
              >
                {loading || currencyLoading ? "Loading..." : "Next"}
              </Button>
            </div>
          </Col>
        </Form>
      </div>
    </div>
  );
};

export default Currency;
