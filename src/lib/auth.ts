import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updatePassword as firebaseUpdatePassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { app } from './firebase';

export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// For admin to create teacher accounts without logging out
let secondaryApp: any = null;
export const createSecondaryUser = async (email: string, pass: string) => {
  if (!secondaryApp) {
    // Re-initialize app with same config but different name
    secondaryApp = initializeApp(app.options, 'SecondaryApp');
  }
  const secondaryAuth = getAuth(secondaryApp);
  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
  await firebaseSignOut(secondaryAuth);
  return cred.user;
};

export const login = async (email: string, pass: string) => {
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export const logout = async () => {
  return await firebaseSignOut(auth);
};

export const updatePassword = async (newPassword: string): Promise<void> => {
  if (!auth.currentUser) throw new Error('No authenticated user');
  await firebaseUpdatePassword(auth.currentUser, newPassword);
};
