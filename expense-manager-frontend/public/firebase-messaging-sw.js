// import { getMessaging } from "firebase/messaging/sw";
// import { onBackgroundMessage } from "firebase/messaging/sw";

// const messaging = getMessaging();
// onBackgroundMessage(messaging, (payload) => {
//   console.log('[firebase-messaging-sw.js] Received background message ', payload);
//   // Customize notification here
//   const notificationTitle = 'Background Message Title';
//   const notificationOptions = {
//     body: 'Background Message body.',
//     icon: '/firebase-logo.png'
//   };

//   self.registration.showNotification(notificationTitle,
//     notificationOptions);
// });

// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "AIzaSyCB8zzWpc0pjA141Afz95uUgioEDQC0xKc",
  authDomain: "college-project-97ee3.firebaseapp.com",
  projectId: "college-project-97ee3",
  storageBucket: "college-project-97ee3.firebasestorage.app",
  messagingSenderId: "417411040479",
  appId: "1:417411040479:web:4caf395f0d230466a6556a",
  measurementId: "G-EDSCMH3FGB",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
messaging.onBackgroundMessage(function (payload) {
  // console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// import { initializeApp } from "firebase/app";
// import { getMessaging, onBackgroundMessage } from "firebase/messaging";

// const firebaseConfig = {
//   apiKey: "AIzaSyBdrZMwPIL48P8_lP1JuAOEiSooTc6pv98",
//   authDomain: "auth.walletsync.app",
//   projectId: "walletsync-a0151",
//   storageBucket: "walletsync-a0151.appspot.com",
//   messagingSenderId: "537987711625",
//   appId: "1:537987711625:web:263c29faabe8ce7651fc58",
//   measurementId: "G-ECLQHSBSZ3",
// };

// const app = initializeApp(firebaseConfig);

// const messaging = getMessaging(app);
// onBackgroundMessage(messaging, (payload) => {
//   console.log("Received background message ");
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//     body: payload.notification.body,
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });
