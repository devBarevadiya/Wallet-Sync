import { useFormik } from "formik";
import * as yup from "yup";
import Layout from "./Layout";
import { Button, Form } from "react-bootstrap";
import InputField from "../../components/inputFields/InputField";
import FirebaseButton from "../../components/FirebaseButton";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AUTH } from "../../constants/routes";
import { signUpThunk, socialLoginThunk } from "../../store/actions";
import { useDispatch, useSelector } from "react-redux";
import { handleFirebaseEvent } from "../../firebase/config";
import { eventEnum } from "../../helpers/enum";

const SignUp = () => {
  const { loading } = useSelector((store) => store.Auth);

  handleFirebaseEvent(eventEnum.SIGNUP_INIT);
  const dispatch = useDispatch();
  const nav = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const initialValues = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchema = yup.object({
    username: yup.string().required("email is required"),
    email: yup
      .string()
      .email("enter valid email")
      .required("email is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters long")
      .matches(/[A-Z]/, "Password must have at least 1 uppercase letter")
      .matches(/[a-z]/, "Password must have at least 1 lowercase letter")
      .matches(/\d/, "Password must have at least 1 number")
      .matches(
        /[@$!%*?&]/,
        "Password must have at least 1 special character (@$!%*?&)"
      )
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .required("confirm password is required")
      .oneOf([yup.ref("password")], "password must be match"),
  });

  const validation = useFormik({
    name: "auth login validation",
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const newValue = { ...values };
      token ? (newValue.deepLinkToken = token) : "";
      delete newValue.confirmPassword;
      const response = await dispatch(signUpThunk(newValue));
      if (signUpThunk.fulfilled.match(response)) {
        handleFirebaseEvent(eventEnum.SIGNUP_COMPLETED);
        resetForm();
        nav(AUTH.SIGN_IN);
        // if (response?.payload?.data.currencies?.length > 0) {
        //   nav(ADMIN.DASHBOARD.PATH);
        // } else {
        //   nav(OTHER_AUTH.CURRENCY);
        // }
      }
    },
  });

  return (
    <Layout title={"create an account"}>
      {/* <Button
          className={`border-0 rounded-2 px-4 py-2 m-3 btn-success text-capitalize`}
        >
          google
        </Button> */}

      <Form onSubmit={validation.handleSubmit}>
        <InputField
          label="username"
          id="username"
          placeholder="enter username"
          name="username"
          onChange={validation.handleChange}
          onBlur={validation.handleBlur}
          value={validation.values.username}
          invalid={validation.touched.username && validation.errors.username}
          errorMessage={validation.errors.username}
        />
        <InputField
          id="email"
          placeholder="enter email address"
          name="email"
          onChange={validation.handleChange}
          onBlur={validation.handleBlur}
          value={validation.values.email}
          invalid={validation.touched.email && validation.errors.email}
          errorMessage={validation.errors.email}
        />
        <InputField
          id="password"
          label="password"
          placeholder="enter your password"
          type="password"
          name="password"
          onChange={validation.handleChange}
          onBlur={validation.handleBlur}
          value={validation.values.password}
          invalid={validation.touched.password && validation.errors.password}
          errorMessage={validation.errors.password}
        />
        <InputField
          id="confirmPassword"
          label="confirm password"
          placeholder="enter your confirm password"
          type="password"
          name="confirmPassword"
          className="mb-3"
          onChange={validation.handleChange}
          onBlur={validation.handleBlur}
          value={validation.values.confirmPassword}
          invalid={
            validation.touched.confirmPassword &&
            validation.errors.confirmPassword
          }
          errorMessage={validation.errors.confirmPassword}
        />
        <span className="d-block text-center p-0 m-0 fs-13 mb-4 pb-1">
          By continuing, You agree to our{" "}
          <Link
            to={`${import.meta.env.VITE_LIVE_URL}/terms-conditions`}
            target="_blank"
          >
            {" "}
            Terms{" "}
          </Link>{" "}
          &{" "}
          <Link
            to={`${import.meta.env.VITE_LIVE_URL}/privacy-policy`}
            target="_blank"
          >
            {" "}
            Privacy Policy{" "}
          </Link>
        </span>
        <Button type="submit" className="primary-btn w-100" disabled={loading}>
          {loading ? "Loading..." : "Sign Up"}
        </Button>
      </Form>

      <div className="mt-lg-4 mt-4 text-center">
        <div className="signin-other-title">
          <span className="fs-15 mb-4 d-block text-color-light-gray position-relative">
            or sign up with
          </span>
        </div>
        <div>
          <FirebaseButton
            callback={socialLoginThunk}
            deepLinkToken={token}
            // validation={validation}
            // otherValues={{ currency: validation.values.currency }}
            // onSuccess={() => nav(AUTH.SIGN_IN)}
          />
        </div>
        <span className="mt-4 d-block fs-14">
          Already have an account?{" "}
          <Link to={AUTH.SIGN_IN} className="text-color-primary">
            Sign in
          </Link>
        </span>
      </div>
    </Layout>
  );
};

export default SignUp;
