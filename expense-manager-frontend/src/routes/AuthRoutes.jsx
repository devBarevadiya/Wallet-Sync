import { AUTH } from "../constants/routes";
import ResetPassword from "../pages/auth/ResetPassword";
import SignIn from "../pages/auth/SignIn";
import SignUp from "../pages/auth/SignUp";

export const AuthRoutes = () => {

  return [
    {
      path: AUTH.SIGN_IN,
      component: <SignIn />,
    },
    {
      path: AUTH.SIGN_UP,
      component: <SignUp />,
    },
    // {
    //   path: AUTH.FORGOT_PASSWORD,
    //   component: <ForgotPassword />,
    // },
    // {
    //   path: AUTH.RESET_PASSWORD + PARAMS_TOKEN,
    //   component: <ResetPassword />,
    // },
  ];
};
