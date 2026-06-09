import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import * as yup from "yup";
import Layout from "./Layout";
import InputField from "../../components/inputFields/InputField";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import { AUTH } from "../../constants/routes";
import { forgotPasswordThunk } from "../../store/actions";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const nav = useNavigate()
  const { user, loading } = useSelector((store) => store.Auth);
  // useEffect(() => {
  //   dispatch(signInThunk({ email: "yash@gmail.com", password: "123456789" }));
  // }, [dispatch]);

  const initialValues = {
    email: "",
  };

  const validationSchema = yup.object({
    email: yup
      .string()
      .email("enter valid email")
      .required("email is required"),
  });

  const validation = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const response = await dispatch(forgotPasswordThunk(values));
      if (forgotPasswordThunk.fulfilled.match(response)) {
        nav(AUTH.SIGN_IN)
        resetForm();
      }
    },
  });

  return (
    <Layout
      title={"Forgot Password?"}
      description="Enter your email address to get the password reset code."
    >
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
        <Button type="submit" className="primary-btn w-100" disabled={loading}>
          {loading ? "Loading..." : "Send Reset Link"}
        </Button>
      </Form>

      <div className="mt-lg-4 mt-4 text-center">
        <span className="mt-4 d-block fs-14">
          Don&apos;t have an account?{" "}
          <Link to={AUTH.SIGN_UP} className="text-color-primary">
            Sign Up
          </Link>
        </span>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
