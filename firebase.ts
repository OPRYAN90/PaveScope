import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCEQX5yzQCXItrGfcxLOmM4Hp4DM_Tvv-4",
  authDomain: "pavescope-12b68.firebaseapp.com",
  projectId: "pavescope-12b68",
  storageBucket: "pavescope-12b68.appspot.com",
  messagingSenderId: "406588760425",
  appId: "1:406588760425:web:043c6ed4db86dbf24a5df8",
  measurementId: "G-6D4LDGW1BM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { app, auth, analytics };