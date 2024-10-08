import { auth } from '../firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
// Remove the import for doc and setDoc
// import { doc, setDoc } from 'firebase/firestore';
// Remove the import for db
// import { db } from './db';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    // Remove the call to updateUserProfile
    // await updateUserProfile(user);
    return user;
  } catch (error) {
    console.error('Error signing in with Google', error);
    throw error;
  }
}

// Remove the updateUserProfile function
// async function updateUserProfile(user: FirebaseUser) {
//   const userRef = doc(db, 'users', user.uid);
//   await setDoc(userRef, {
//     displayName: user.displayName,
//     email: user.email,
//     photoURL: user.photoURL,
//     // Add any other fields you want to store
//   }, { merge: true });
// }

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing up with email", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in with email", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};