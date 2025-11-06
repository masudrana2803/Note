// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZrEqjTrcEBXtePIWkfU8HWhpqbr6WGYE",
  authDomain: "note-26566.firebaseapp.com",
  projectId: "note-26566",
  storageBucket: "note-26566.firebasestorage.app",
  messagingSenderId: "890074349347",
  appId: "1:890074349347:web:425d565e5ba62c93ab5696",
  measurementId: "G-8K7RNNHYL6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);