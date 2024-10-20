import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from 'firebase/firestore';

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
const storage = getStorage(app);
const db = getFirestore(app);

// Dynamically import analytics
let analytics = null;
if (typeof window !== 'undefined') {
  import('firebase/analytics').then((module) => {
    analytics = module.getAnalytics(app);
  });
}

export { app, auth, analytics, storage, db };