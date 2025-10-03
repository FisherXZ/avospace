// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMBoG-NX1lJmf01CAd26SY1Xp6B_PAMzU",
  authDomain: "avospace-6a984.firebaseapp.com",
  projectId: "avospace-6a984",
  storageBucket: "avospace-6a984.firebasestorage.app",
  messagingSenderId: "378745001771",
  appId: "1:378745001771:web:5257c9b6fc40ab98a8d76e",
  measurementId: "G-XNYHDHSFGC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;