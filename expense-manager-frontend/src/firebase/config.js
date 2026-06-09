import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  getAuth,
} from "firebase/auth";
import { getMessaging, getToken } from "firebase/messaging";
import {
  fetchAndActivate,
  getRemoteConfig,
  getValue,
} from "firebase/remote-config";

const firebaseEnv = import.meta.env;

export const firebaseConfig = {
  apiKey: firebaseEnv.VITE_FIREBASE_API_KEY,
  authDomain: firebaseEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: firebaseEnv.VITE_FIREBASE_PROJECT_ID,
  storageBucket: firebaseEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseEnv.VITE_FIREBASE_APP_ID,
  measurementId: firebaseEnv.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
const remoteConfig = getRemoteConfig(app);
remoteConfig.settings.minimumFetchIntervalMillis = 600000;
remoteConfig.defaultConfig = {
  promocodeshow: true,
};

const initializeRemoteConfigDefaults = async () => {
  try {
    const rcDefaultsFile = await fetch("/remote_config_defaults.json");
    const rcDefaultsJson = await rcDefaultsFile.json();
    remoteConfig.defaultConfig = rcDefaultsJson;
  } catch (error) {
    console.error("Failed to load remote config defaults:", error);
  }
};

initializeRemoteConfigDefaults();

// const val = getValue(remoteConfig, "promocodeshow");
// export const firebaseIsPromoCodeShow = val.asBoolean();

export const fetchRemoteConfig = async () => {
  try {
    // Fetch the latest values from Firebase Remote Config
    await fetchAndActivate(remoteConfig);

    // Get the updated value
    const promocodeshow = getValue(remoteConfig, "promocodeshow").asBoolean();

    return promocodeshow;
  } catch (error) {
    console.error("Error fetching Remote Config:", error);
    return null;
  }
};

export const db = getFirestore(app);
export const auth = getAuth(app);
export const facebookLogin = new FacebookAuthProvider();
export const googleLogin = new GoogleAuthProvider();
googleLogin.setCustomParameters({
  prompt: "select_account", // This will always show the account selection dialog
});
const appleLoginFunc = () => {
  const provider = new OAuthProvider("apple.com");
  provider.addScope("email");
  provider.addScope("name");
  provider.setCustomParameters({
    locale: "en",
  });

  return provider;
};
export const appleLogin = appleLoginFunc();

export const messaging = getMessaging(app);

export const requestNotification = async () => {
  const token = await getToken(messaging, {
    vapidKey:
      "BKjdGiP4Lkqh8ptBnyOCh2g1q46k0KJNVJ-Kbuh_8xhDCbswmWs-J2tMgxBOnPX7fJ9Lg_LsG_9l98Hc0WAkCt8",
  });
  return token;
};

export const handleFirebaseEvent = (event) => {
  logEvent(analytics, event);
};
