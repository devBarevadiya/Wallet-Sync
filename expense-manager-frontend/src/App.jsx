import "bootstrap/dist/css/bootstrap.min.css";
import "remixicon/fonts/remixicon.css";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Aos from "aos";
import "aos/dist/aos.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { initGA, logPageView } from "./config/analytics";
import { defineElement } from "@lordicon/element";
import CustomHelmet from "./components/helmet/CustomHelmet";
import AllRoutes from "./routes/AllRoutes";
import { useSelector } from "react-redux";

import ErrorBoundary from "./components/common/ErrorBoundary";
import { toastError, toastSuccess } from "./config/toastConfig";

function App() {
  // const LazyAllRoutes = React.lazy(() => import("./routes/AllRoutes"));
  const { documentTitle } = useSelector((store) => store.Filters);
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState();
  const capitalizeFirstWord = (str) => {
    return str.replace(/\b\w/g, (match) => match.toUpperCase());
  };
  const titleValue = location.pathname
    .split("/")
    .slice(-1)[0]
    .split("-")
    .join(" ");

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin === import.meta.env.VITE_LIVE_URL) {
        const currentToken = localStorage.getItem("token");
        event.source?.postMessage({ token: currentToken }, event.origin);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return undefined;

    let cancelled = false;
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        if (!cancelled) {
          console.log("Registration successful, scope is:", registration.scope);
        }
      })
      .catch((err) => {
        if (!cancelled) console.log("Service worker registration failed, error:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      toastSuccess("Back online! Reconnecting to server...");
    };
    const handleOffline = () => {
      toastError("You are currently offline. Changes will sync when reconnected.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const lazyLoadItems = async () => {
      const lottie = await import("lottie-web");
      window.lottie = lottie;

      defineElement(lottie.loadAnimation);
    };
    lazyLoadItems();
  }, []);

  useEffect(() => {
    initGA();
    logPageView();
  }, []);

  useEffect(() => {
    Aos.init({
      once: true,
      duration: 800,
    });
  }, []);

  useEffect(() => {
    globalThis.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    setPageTitle(
      (titleValue ? capitalizeFirstWord(titleValue + " " + "-") : "") +
        " " +
        "Wallet Sync - Budget Planner and Expense Tracker"
    );
  }, [location.pathname, titleValue]);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {pageTitle && (
        <CustomHelmet title={documentTitle ? documentTitle : pageTitle} />
      )}
      <ErrorBoundary>
        <AllRoutes />
      </ErrorBoundary>
    </>
  );
}

export default App;
