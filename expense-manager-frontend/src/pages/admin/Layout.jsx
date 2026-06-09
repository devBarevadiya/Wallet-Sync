import PropTypes from "prop-types";
import Header from "../../components/admin/header/Header";
import SideBar from "../../components/admin/sideBar/SideBar";
import { cloneElement, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ON_BOARDING } from "../../constants/routes";
import { useSelector } from "react-redux";
import { setDocumentTitle } from "../../store/filters/slice";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { messaging, requestNotification } from "../../firebase/config";
import {
  deviceTokenThunk,
  getAccountThunk,
  verifyTokenThunk,
} from "../../store/actions";
import { onMessage } from "firebase/messaging";
import { toastSuccess } from "../../config/toastConfig";
import { getAllGroupsThunk } from "../../store/group/thunk";
import { logout } from "../../helpers/commonFunctions";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Stripe from "../../components/stripe/Stripe";
import Cancel from "../../components/stripe/Cancel";
import { setCurrentStep } from "../../store/onBoarding/slice";
import { setNotificationStatus } from "../../store/notification/slice";

const AdminLayout = ({ children }) => {
  const {
    token,
    user = {},
    loading,
    socialLoading,
  } = useSelector((store) => store.Auth);
  const { data: accountData } = useSelector((store) => store.Account);
  const { groupData, singleUserGroupData } = useSelector(
    (store) => store.Group
  );
  const currency = user?.currencies;
  const nav = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const deviceToken = localStorage.getItem("deviceToken") || "";

  useEffect(() => {
    try {
      if (
        !loading &&
        !socialLoading &&
        token &&
        user &&
        Object.keys(user)?.length &&
        (!currency || currency?.length === 0)
      ) {
        nav(ON_BOARDING);
      }
    } catch (error) {
      nav(ON_BOARDING);
    }
  }, [loading, socialLoading, token, user, currency, nav]);

  useEffect(() => {
    if (!location.pathname.includes("settings")) dispatch(setDocumentTitle(""));
  }, [location.pathname, dispatch]);

  useEffect(() => {
    if (!groupData?.length && user?._id) {
      dispatch(getAllGroupsThunk());
    }
  }, [user]);

  // if ("serviceWorker" in navigator) {
  //   window.addEventListener("load", () => {
  //     navigator.serviceWorker
  //       .register("/firebase-messaging-sw.js", { type: "module" })
  //       .then((registration) => {
  //         console.log(
  //           "Service Worker registered with scope:",
  //           registration.scope
  //         );
  //       })
  //       .catch((err) => {
  //         console.error("Service Worker registration failed:", err);
  //       });
  //   });
  // }

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then(async (permission) => {
        if (permission === "granted" && !deviceToken) {
          dispatch(setNotificationStatus("granted"));
          const token = await requestNotification();
          if (token) {
            localStorage.setItem("deviceToken", token);
            dispatch(
              deviceTokenThunk({
                deviceToken: token,
                deviceType: "WEB",
              })
            );
          }
        } else if (permission === "denied") {
          console.log("Notification permission denied.");
          dispatch(setNotificationStatus("denied"));
        } else {
          console.log("Notification permission closed or default state.");
          dispatch(setNotificationStatus("default"));
        }
      });
    } else {
      console.log("This browser does not support notifications.");
    }
    onMessage(messaging, (payload) => {
      const notification = payload.notification || "";
      const title = payload.notification.title || "";
      // toastSuccess(notification);
      new Notification(title, {
        ...notification,
      });
    });
  }, []);

  useEffect(() => {
    Swal.close();
  }, [location]);

  useEffect(() => {
    const handleStorageChange = async (e) => {
      if (e.key === "token") {
        const response = await dispatch(
          verifyTokenThunk({ token: e.newValue })
        );
        if (verifyTokenThunk.rejected.match(response)) {
          logout();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  useEffect(() => {
    const tokenHandler = async () => {
      if (token) {
        const response = await dispatch(verifyTokenThunk({ token }));
        if (verifyTokenThunk.rejected.match(response)) {
          logout();
        }
      }
    };
    tokenHandler();
  }, [dispatch, token]);

  useEffect(() => {
    const fetchAccount = async () => {
      if (!accountData?.length) {
        const response = await dispatch(getAccountThunk());
        if (getAccountThunk.fulfilled.match(response)) {
          if (!response?.payload?.data?.length) {
            // dispatch(setCurrentStep(3));
            // nav(ON_BOARDING);
          }
        }
      }
    };
    fetchAccount();
  }, []);

  return (
    <>
      <div className={`admin-main-layout d-flex`}>
        <SideBar />
        <div
          className={`position-relative admin-primary-bg z-1 min-vh-100 w-100 overflow-x-hidden`}
        >
          <Header
            email={user?.username || user?.email || "user@gmail.com"}
            role={user?.role}
          />
          <div className="h-70px"></div>
          <div>
            <section className={`px-3 px-md-4`}>
              {/* This method for pass props to children while children comes dynamically, suppose <Children props={}/> like this  */}
              {cloneElement(children, { user })}
            </section>
          </div>
          {/* <Footer /> */}
        </div>
      </div>
    </>
  );
};

AdminLayout.propTypes = {
  children: PropTypes.node,
};

export default AdminLayout;
