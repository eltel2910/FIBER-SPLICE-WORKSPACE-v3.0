import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Retrieve Firebase credentials from Vite environment variables.
// These should be defined in a .env file or the platform settings.
// E.g., VITE_FIREBASE_API_KEY=AIzaSy...
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

const hasConfig = !!apiKey;

// Fallback configuration to prevent startup crashes when keys are not defined yet
const firebaseConfig = {
  apiKey: apiKey || "mock-api-key-to-prevent-startup-crash",
  authDomain: authDomain || "mock-auth-domain.firebaseapp.com",
  projectId: projectId || "mock-project-id",
  storageBucket: storageBucket || "mock-storage.appspot.com",
  messagingSenderId: messagingSenderId || "000000000000",
  appId: appId || "1:000000000000:web:00000000000000"
};

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const isFirebaseConfigured = hasConfig;
