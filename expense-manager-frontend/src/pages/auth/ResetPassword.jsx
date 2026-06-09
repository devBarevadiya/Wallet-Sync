import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import { resetPasswordThunk } from "../../store/actions";
import Layout from "./Layout";
import { Button, Form } from "react-bootstrap";
import InputField from "../../components/inputFields/InputField";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AUTH } from "../../constants/routes";

const ResetPassword = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((store) => store.Auth);
  const { token } = useParams();
  const nav = useNavigate();
  // useEffect(() => {
  //   dispatch(signInThunk({ email: "yash@gmail.com", password: "123456789" }));
  // }, [dispatch]);

  const initialValues = {
    password: "",
    confirm_password: "",
  };

  const validationSchema = yup.object({
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
    confirm_password: yup
      .string()
      .required("confirm password is required")
      .oneOf([yup.ref("password")], "password must match"),
  });

  const validation = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const response = await dispatch(resetPasswordThunk({ token, values }));
      if (resetPasswordThunk.fulfilled.match(response)) {
        resetForm();
        nav(AUTH.SIGN_IN);
      }
    },
  });

  return (
    <Layout
      title={"Reset Password"}
      description="Enter your new password twice below to reset a new password."
    >
      {/* <Button
            className={`border-0 rounded-2 px-4 py-2 m-3 btn-success text-capitalize`}
          >
            google
          </Button> */}

      <Form onSubmit={validation.handleSubmit}>
        <InputField
          id="password"
          label="new password"
          placeholder="enter your new password"
          type="password"
          name="password"
          onChange={validation.handleChange}
          onBlur={validation.handleBlur}
          value={validation.values.password}
          invalid={validation.touched.password && validation.errors.password}
          errorMessage={validation.errors.password}
        />
        <InputField
          id="confirm_password"
          label="confirm password"
          placeholder="enter your confirm password"
          type="password"
          name="confirm_password"
          onChange={validation.handleChange}
          onBlur={validation.handleBlur}
          value={validation.values.confirm_password}
          invalid={
            validation.touched.confirm_password &&
            validation.errors.confirm_password
          }
          errorMessage={validation.errors.confirm_password}
        />
        <Button type="submit" className="primary-btn w-100" disabled={loading}>
          {loading ? "Loading..." : "Reset Password"}
        </Button>
      </Form>

      <div className="mt-lg-4 mt-4 text-center">
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

export default ResetPassword;
