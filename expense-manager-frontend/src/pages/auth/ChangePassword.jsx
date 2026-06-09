import { useFormik } from "formik";
import * as yup from "yup";
import Layout from "./Layout";
import { Button, Form } from "react-bootstrap";
import InputField from "../../components/inputFields/InputField";
import { Link, useNavigate } from "react-router-dom";
import { ADMIN, AUTH } from "../../constants/routes";
import { useSelector } from "react-redux";
import { changePasswordThunk } from "../../store/actions";
import { useDispatch } from "react-redux";

const ChangePassword = () => {
  const { loading } = useSelector((store) => store.Auth);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const initialValues = {
    old_password: "",
    password: "",
    confirm_password: "",
  };

  const validationSchema = yup.object({
    old_password: yup
      .string()
      .min(6, "min 6 character required")
      .required("old password is required"),
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
      const response = await dispatch(changePasswordThunk(values));
      if (changePasswordThunk.fulfilled.match(response)) {
        resetForm();
        nav(ADMIN.DASHBOARD.PATH);
      }
    },
  });

  return (
    <Layout
      title={"Change Password"}
      description="Enter your new password twice below to reset a new password."
    >
      <Form onSubmit={validation.handleSubmit}>
        <InputField
          id="old_password"
          label="old password"
          placeholder="enter your old password"
          type="password"
          name="old_password"
          onChange={validation.handleChange}
          onBlur={validation.handleBlur}
          value={validation.values.old_password}
          invalid={
            validation.touched.old_password && validation.errors.old_password
          }
          errorMessage={validation.errors.old_password}
        />
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
          // className="mb-3"
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

        {/* <Link
          to={AUTH.FORGOT_PASSWORD}
          className="d-block text-end text-color-primary p-0 m-0 fs-14 mb-3"
        >
          Forgot Password!
        </Link> */}

        <Button type="submit" className="primary-btn w-100" disabled={loading}>
          {loading ? "Loading..." : "Change Password"}
        </Button>
      </Form>

      {/* <div className="mt-lg-4 mt-4 text-center">
        <span className="mt-4 mt-md-5 d-block fs-14">
          Don&apos;t have an account?{" "}
          <Link to={ADMIN.DASHBOARD} className="text-color-primary">
            Sign Up
          </Link>
        </span>
      </div> */}
    </Layout>
  );
};

export default ChangePassword;
