import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgRSz3nyICgxq_wKmBXdy9X21yK0B1m10",
  authDomain: "fiberlink-pro-v3-production.firebaseapp.com",
  projectId: "fiberlink-pro-v3-production",
  storageBucket: "fiberlink-pro-v3-production.firebasestorage.app",
  messagingSenderId: "885433296596",
  appId: "1:885433296596:web:71904857a72698d034fd41"
};

// Check if keys are properly loaded from the environment (now hardcoded production configuration is fully integrated)
export const isFirebaseConfigured = true;

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth = getAuth(app);
