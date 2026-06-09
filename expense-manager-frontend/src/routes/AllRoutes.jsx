import { useSelector } from "react-redux";
import { AuthRoutes as Auth } from "./AuthRoutes";
import { AdminRoutes as Admin } from "./AdminRoutes";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../pages/admin/Layout";
import {
  ADMIN,
  AUTH,
  CLIENT,
  ON_BOARDING,
  OTHER_AUTH,
} from "../constants/routes";
// import ClientLayout from "../pages/client/Layout";
import RoleProtectedRoutes from "./RoleProtectedRoutes";
import ChangePassword from "../pages/auth/ChangePassword";
import { APP_ROUTE } from "../helpers/enum";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Success from "../pages/stripe/Success";
// import Reject from "../pages/stripe/Reject";
import OnBoarding from "./OnBoarding";
import Layout from "../pages/onBoarding/Layout";
import ResetPassword from "../pages/auth/ResetPassword";
import Currency from "../pages/onBoarding/Currency";
import SignUp from "../pages/auth/SignUp";

const AllRoutes = () => {
  const { token, user } = useSelector((store) => store.Auth);
  const { isSubscriptionScreen } = useSelector((store) => store.Filters);
  const PARAMS_TOKEN = "/:token";
  const currency = user?.currencies;
  const AuthRoutes = Auth();
  const AdminRoutes = Admin();
  // const OnBoardingRoute = OnBoarding();

  return (
    <Routes>
      {/* ========================== Client Routes ========================== */}
      {/* {ClientRoutes?.map((item, index) => {
        const path = item?.path;
        return (
          <Route
            key={index}
            path={path}
            element={<ClientLayout>{item?.component}</ClientLayout>}
          ></Route>
        );
      })} */}
      {/* ========================== Admin Routes ========================== */}
      {/* {token &&
        AdminRoutes?.map((item, index) => {
          const path = item?.path;
          return (
            <Route
              key={index}
              path={path}
              element={<AdminLayout>{item?.component}</AdminLayout>}
            ></Route>
          );
        })} */}
      {token &&
        AdminRoutes?.map((item, index) => {
          const path = item?.path;
          const admin = item?.admin;
          return (
            <Route
              key={index}
              path={path}
              element={
                <AdminLayout>
                  {admin ? (
                    <RoleProtectedRoutes>{item?.component}</RoleProtectedRoutes>
                  ) : (
                    item?.component
                  )}
                </AdminLayout>
              }
            ></Route>
          );
        })}
      {/* ========================== Auth Routes ========================== */}

      {AuthRoutes?.map((item, index) => {
        const path = item?.path;
        return (
          <Route
            key={index}
            path={path}
            element={
              token && (!user?._id || currency?.length > 0) ? (
                <Navigate to={ADMIN.DASHBOARD.PATH} replace={true} />
              ) : (
                item?.component
              )
            }
          ></Route>
        );
      })}

      <Route path={AUTH.FORGOT_PASSWORD} element={<ForgotPassword />}></Route>
      <Route
        path={AUTH.RESET_PASSWORD + PARAMS_TOKEN}
        element={<ResetPassword />}
      ></Route>

      {/* {token &&
        OtherAuthRoutes?.map((item, index) => {
          return (
            <Route
              key={index}
              path={item.path}
              element={item.component}
            ></Route>
          );
        })} */}
      {token && !currency?.length > 0 && (
        <Route path={OTHER_AUTH.CURRENCY} element={<Currency />} />
      )}
      {token && (
        <Route
          path={OTHER_AUTH.CHANGE_PASSWORD}
          element={<ChangePassword />}
        ></Route>
      )}

      {/* ========================== On Boaring Routes ========================== */}

      {token && (!user?.currencies?.length || isSubscriptionScreen) && (
        <Route path={ON_BOARDING} element={<Layout />}></Route>
      )}

      {/* ========================== Extra Routes ========================== */}
      <Route
        path="/*"
        // element={token && <Navigate to="/login" replace={true} />}
        element={
          location.pathname.startsWith(APP_ROUTE) ? (
            token ? (
              <Navigate to={ADMIN.DASHBOARD.PATH} replace={true} />
            ) : (
              <Navigate to={AUTH.SIGN_IN} replace={true} />
            )
          ) : (
            <Navigate to={AUTH.SIGN_IN} replace={true} />
          )
        }
      />

      <Route path={OTHER_AUTH.INVITE} element={<SignUp />} />

      {/* After Payment Urls */}
      <Route
        path={"/subscription-success/:token"}
        element={<Success />}
      ></Route>
    </Routes>
  );
};

export default AllRoutes;
