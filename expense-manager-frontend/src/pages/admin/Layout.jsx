import PropTypes from "prop-types";
import Header from "../../components/admin/header/Header";
import SideBar from "../../components/admin/sideBar/SideBar";
import { cloneElement, useEffect, useRef } from "react";
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
  analyticsThunk,
  verifyTokenThunk,
} from "../../store/actions";
import { onMessage } from "firebase/messaging";
import { getAllGroupsThunk } from "../../store/group/thunk";
import { logout } from "../../helpers/commonFunctions";
import { setNotificationStatus } from "../../store/notification/slice";

const AdminLayout = ({ children }) => {
  const {
    token,
    user = {},
    loading,
    socialLoading,
  } = useSelector((store) => store.Auth);
  const { groupData } = useSelector((store) => store.Group);
  const { chartData } = useSelector((store) => store.Dashboard);
  const currency = user?.currencies;
  const nav = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const deviceToken = localStorage.getItem("deviceToken") || "";
  const refreshInFlight = useRef(false);
  const chartDataRef = useRef(chartData);
  const hasGroupsRef = useRef(Boolean(groupData?.length));

  chartDataRef.current = chartData;
  hasGroupsRef.current = Boolean(groupData?.length);

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
    let unsubscribeMessage = () => {};

    const setupNotifications = async () => {
      if (!("Notification" in window)) {
        console.log("This browser does not support notifications.");
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          dispatch(setNotificationStatus("granted"));
          if (!deviceToken) {
            const notificationToken = await requestNotification();
            if (notificationToken) {
              localStorage.setItem("deviceToken", notificationToken);
              dispatch(
                deviceTokenThunk({
                  deviceToken: notificationToken,
                  deviceType: "WEB",
                })
              );
            }
          }
        } else {
          dispatch(setNotificationStatus(permission));
        }
      } catch (error) {
        console.warn("Notification setup failed:", error);
        dispatch(setNotificationStatus("default"));
      }
    };

    setupNotifications();

    try {
      unsubscribeMessage = onMessage(messaging, (payload) => {
        const notification = payload?.notification || {};
        const title = notification.title || "";
        if (!title || Notification.permission !== "granted") return;
        new Notification(title, { ...notification });
      });
    } catch (error) {
      console.warn("Notification listener setup failed:", error);
    }

    return () => unsubscribeMessage();
  }, [deviceToken, dispatch]);

  useEffect(() => {
    Swal.close();
  }, [location]);

  useEffect(() => {
    const handleStorageChange = async (e) => {
      if (e.key === "token") {
        if (!e.newValue) {
          // User logged out in another tab
          logout(false);
        } else {
          // A different tab may have authenticated a different user. Reload so
          // every Redux slice and page starts from the new user's data.
          window.location.reload();
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
      if (refreshInFlight.current) return;
      const currentToken = localStorage.getItem("token") || token;
      if (currentToken) {
        const response = await dispatch(verifyTokenThunk({ token: currentToken }));
        if (verifyTokenThunk.fulfilled.match(response)) {
          refreshInFlight.current = true;
          try {
            const refreshRequests = [
              dispatch(getAccountThunk()),
              dispatch(analyticsThunk(chartDataRef.current)),
            ];
            if (!hasGroupsRef.current) {
              refreshRequests.push(dispatch(getAllGroupsThunk()));
            }
            await Promise.allSettled(refreshRequests);
          } finally {
            refreshInFlight.current = false;
          }
        } else if (verifyTokenThunk.rejected.match(response)) {
          const status = response.payload?.status;
          if (status === 401 || status === 403) {
            logout(false);
          }
        }
      } else {
        logout(false);
      }
    };
    tokenHandler();

    // Re-verify session and refresh data when user switches back to an idle tab
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        tokenHandler();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
  }, [dispatch, token]);

  return (
    <>
      <div className={`admin-main-layout d-flex`}>
        <SideBar />
        <div
          className={`position-relative admin-primary-bg z-1 min-vh-100 w-100 overflow-x-hidden`}
        >
          <Header
            email={user?.username || user?.email || ""}
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
