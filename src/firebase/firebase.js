// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: "infinite-chess-94f69.firebaseapp.com",
  projectId: "infinite-chess-94f69",
  storageBucket: "infinite-chess-94f69.firebasestorage.app",
  messagingSenderId: "79084063365",
  appId: "1:79084063365:web:3e14de3c61152a30ca37ec",
  measurementId: "G-K7GGMJDG3X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAnalytics(app);

export { app, auth }