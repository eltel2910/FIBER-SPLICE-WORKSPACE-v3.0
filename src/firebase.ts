import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCr-AHiIpHKpUs09PgkVEvh6tIcCEjaqXg",
  authDomain: "login-beta-b9557.firebaseapp.com",
  projectId: "login-beta-b9557",
  storageBucket: "login-beta-b9557.firebasestorage.app",
  messagingSenderId: "283833117451",
  appId: "1:283833117451:web:3c6bd4885cd82a7b84900e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

