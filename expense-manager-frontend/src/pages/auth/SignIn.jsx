import Layout from "./Layout";
import { useDispatch, useSelector } from "react-redux";
import { signInThunk, socialLoginThunk } from "../../store/actions";
import { Button, Form } from "react-bootstrap";
import FirebaseButton from "../../components/FirebaseButton";
import InputField from "../../components/inputFields/InputField";
import * as yup from "yup";
import { useFormik } from "formik";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ADMIN, AUTH, ON_BOARDING, OTHER_AUTH } from "../../constants/routes";
import { setIsSubScriptionScreen } from "../../store/filters/slice";
import { handleFirebaseEvent } from "../../firebase/config";
import { eventEnum } from "../../helpers/enum";

const SignIn = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((store) => store.Auth);
  const nav = useNavigate();
  const location = useLocation();

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = yup.object({
    email: yup
      .string()
      .email("enter valid email")
      .required("email is required"),
    password: yup
      .string()
      .min(6, "min 6 character required")
      .required("password is required"),
  });

  const validation = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const response = await dispatch(signInThunk(values));
      if (signInThunk.fulfilled.match(response)) {
        handleFirebaseEvent(eventEnum.LOGIN);
        resetForm();
        if (response?.payload?.currencies?.length > 0) {
          nav(ADMIN.DASHBOARD.PATH);
        } else {
          dispatch(setIsSubScriptionScreen(true));
          nav(ON_BOARDING);
        }
      }
    },
  });

  return (
    <Layout title={"Login"}>
      {/* <Button
        className={`border-0 rounded-2 px-4 py-2 m-3 btn-success text-capitalize`}
      >
        google
      </Button> */}

      <Form onSubmit={validation.handleSubmit}>
        <InputField
          placeholder="enter email address"
          name="email"
          onChange={validation.handleChange}
          onBlur={validation.handleBlur}
          value={validation.values.email}
          invalid={validation.touched.email && validation.errors.email}
          errorMessage={validation.errors.email}
        />
        <InputField
          label="password"
          className="mb-3"
          placeholder="enter your password"
          type="password"
          name="password"
          onChange={validation.handleChange}
          onBlur={validation.handleBlur}
          value={validation.values.password}
          invalid={validation.touched.password && validation.errors.password}
          errorMessage={validation.errors.password}
        />
        <Link
          to={AUTH.FORGOT_PASSWORD}
          className="d-block text-end text-color-primary p-0 m-0 fs-14 mb-3"
        >
          Forgot Password!
        </Link>
        <Button type="submit" className="primary-btn w-100" disabled={loading}>
          {loading ? "Loading..." : "Sign In"}
        </Button>
      </Form>

      <div className="mt-lg-4 mt-4 text-center">
        <div className="signin-other-title">
          <span className="fs-15 mb-4 d-block text-color-light-gray position-relative">
            or sign in with
          </span>
        </div>
        <div>
          <FirebaseButton callback={socialLoginThunk} />
        </div>
        <span className="mt-4 mt-md-5 d-block fs-14">
          Don&apos;t have an account?{" "}
          <Link to={AUTH.SIGN_UP} className="text-color-primary">
            Sign Up
          </Link>
        </span>
      </div>
    </Layout>
  );
};

export default SignIn;
