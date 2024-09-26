import { useEffect } from 'react';
import { initializeFirebase } from '../app/firebase-client';

export default function FirebaseComponent() {
  useEffect(() => {
    initializeFirebase();
  }, []);

  return null;
}