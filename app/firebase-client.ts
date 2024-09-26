import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Your Firebase configuration here
};

export function initializeFirebase() {
  if (typeof window !== 'undefined' && !getApps().length) {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const storage = getStorage(app);
    const auth = getAuth(app);
    
    let analytics = null;
    if (process.env.NODE_ENV === 'production') {
      import('firebase/analytics').then(({ getAnalytics }) => {
        analytics = getAnalytics(app);
      });
    }

    return { app, db, storage, auth, analytics };
  }
  return null;
}