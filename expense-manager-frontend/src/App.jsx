import "bootstrap/dist/css/bootstrap.min.css";
import "remixicon/fonts/remixicon.css";
import "./index.css";
import { Toaster } from "react-hot-toast";
import React, { Suspense, useEffect, useState } from "react";
import { getToken } from "./helpers/api_helper";
import { useDispatch } from "react-redux";
import { verifyTokenThunk } from "./store/actions";
import { logout } from "./helpers/commonFunctions";
import { useLocation } from "react-router-dom";
import Aos from "aos";
import "aos/dist/aos.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Loader from "./components/loader/Loader";
import { initGA, logPageView } from "./config/analytics";
import { defineElement } from "@lordicon/element";
import CustomHelmet from "./components/helmet/CustomHelmet";
import AllRoutes from "./routes/AllRoutes";
import { useSelector } from "react-redux";
import { ErrorCode, Purchases, PurchasesError } from "@revenuecat/purchases-js";

function App() {
  // const LazyAllRoutes = React.lazy(() => import("./routes/AllRoutes"));
  const dispatch = useDispatch();
  const { documentTitle } = useSelector((store) => store.Filters);
  const token = getToken();
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

  window.addEventListener("message", (event) => {
    if (event.origin === import.meta.env.VITE_LIVE_URL) {
      const token = localStorage.getItem("token"); // Get token from localStorage
      event.source.postMessage({ token }, event.origin); // Send back token
    }
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then(function (registration) {
        console.log("Registration successful, scope is:", registration.scope);
      })
      .catch(function (err) {
        console.log("Service worker registration failed, error:", err);
      });
  }

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

  // useEffect(() => {
  //   const validateApiKey = async () => {
  //     try {
  //       // const apiKey = "rcb_sb_tUhqDWVrAgXpswgyGKtQwvfmA";
  //       // const apiKey = "rcb_KwnrhiobIwIsIFNXbgMvuEEoqSzb";
  //       const apiKey = "strp_mBTnxgppRCkluePlJLwuwJvLRoC";
  //       const api_key_regex = /^rcb_[a-zA-Z0-9_.-]+$/;
  //       if (!api_key_regex.test(apiKey)) {
  //         throw new PurchasesError(
  //           ErrorCode.InvalidCredentialsError,
  //           "Invalid API key. Use your RevenueCat Billing API key."
  //         );
  //       }
  //     } catch (error) {
  //       console.error("Error fetching offerings:", error); // Handle errors here
  //     }
  //   };

  //   validateApiKey();
  // }, []);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {pageTitle && (
        <CustomHelmet title={documentTitle ? documentTitle : pageTitle} />
      )}
      {/* <Suspense fallback={<Loader />}>
        <LazyAllRoutes />
      </Suspense> */}
      <AllRoutes />
    </>
  );
}

export default App;
