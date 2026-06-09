// src/ga4.js
import ReactGA from "react-ga4";

// Initialize GA4 with your Measurement ID
export const initGA = () => {
  ReactGA.initialize("G-ECLQHSBSZ3"); // Replace with your Measurement ID
};

// Track page views
export const logPageView = () => {
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};

// Track custom events
export const logEvent = (category, action, label) => {
  ReactGA.event({ category, action, label });
};
