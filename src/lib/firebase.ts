import { getApp, getApps, initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCi4niCQk6WK8qlTqkzTkQxjbXEg_Or8s8",
  authDomain: "clarachirigati.firebaseapp.com",
  projectId: "clarachirigati",
  storageBucket: "clarachirigati.firebasestorage.app",
  messagingSenderId: "111948998364",
  appId: "1:111948998364:web:4d7ae02b7af94c02eaf619",
  measurementId: "G-F3J5JX9TJ4",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

let analyticsPromise: Promise<Analytics | null> | null = null;

export function initFirebaseAnalytics() {
  if (!import.meta.env.PROD) return Promise.resolve(null);
  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => (supported ? getAnalytics(firebaseApp) : null))
      .catch(() => null);
  }
  return analyticsPromise;
}
