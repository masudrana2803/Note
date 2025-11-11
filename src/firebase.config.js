// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBArI_sSA2fUWy7rTKUrgdLegl3FuE_suc",
  authDomain: "note-74e09.firebaseapp.com",
  projectId: "note-74e09",
  storageBucket: "note-74e09.firebasestorage.app",
  messagingSenderId: "877096235637",
  appId: "1:877096235637:web:3d8fc13267ec7cfd9bbe3c",
  measurementId: "G-XKRTF97HX4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
