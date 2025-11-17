// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBMBoG-NX1lJmf01CAd26SY1Xp6B_PAMzU",
    authDomain: "avospace-6a984.firebaseapp.com",
    projectId: "avospace-6a984",
    storageBucket: "avospace-6a984.firebasestorage.app",
    messagingSenderId: "378745001771",
    appId: "1:378745001771:web:5257c9b6fc40ab98a8d76e",
    measurementId: "G-XNYHDHSFGC"
  };

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
