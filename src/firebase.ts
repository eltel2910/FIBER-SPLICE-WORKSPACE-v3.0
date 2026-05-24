import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// We read from localStorage directly to share credentials between the database config and primary authentication.
// This allows the user's custom credentials to dynamically configure authentication as well.
const LOCAL_STORAGE_KEY = "fiber_custom_firebase_config_v3";

let customConfig: any = null;
try {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (raw) {
    customConfig = JSON.parse(raw);
  }
} catch (e) {
  // Ignore localStorage read errors in restricted contexts
}

// Retrieve general Firebase credentials from Vite environment variables (for production deployments).
// This keeps secrets securely defined on the server side/pipeline and never raw in GitHub source code.
const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const envStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const envMessagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const envAppId = import.meta.env.VITE_FIREBASE_APP_ID;

// Config priority:
// 1. Stored user custom database settings in localStorage (safely private and local to current browser)
// 2. Hosting climate environment variables (VITE_FIREBASE_*)
const activeConfig = (customConfig && customConfig.apiKey) ? customConfig : {
  apiKey: envApiKey,
  authDomain: envAuthDomain,
  projectId: envProjectId,
  storageBucket: envStorageBucket,
  messagingSenderId: envMessagingSenderId,
  appId: envAppId
};

const hasConfig = !!activeConfig.apiKey;

// Fallback configuration to prevent startup crashes when keys are not defined yet
const firebaseConfig = {
  apiKey: activeConfig.apiKey || "mock-api-key-to-prevent-startup-crash",
  authDomain: activeConfig.authDomain || "mock-auth-domain.firebaseapp.com",
  projectId: activeConfig.projectId || "mock-project-id",
  storageBucket: activeConfig.storageBucket || "mock-storage.appspot.com",
  messagingSenderId: activeConfig.messagingSenderId || "000000000000",
  appId: activeConfig.appId || "1:000000000000:web:00000000000000"
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
