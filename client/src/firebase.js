


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCVpAcWg7EzOzNFsYpiCOs-CsgglwN3ZFg",
  authDomain: "aura-fashion-851fe.firebaseapp.com",
  projectId: "aura-fashion-851fe",
  storageBucket: "aura-fashion-851fe.firebasestorage.app",
  messagingSenderId: "218873774644",
  appId: "1:218873774644:web:8bea1f1c296b25cca3c061",
  measurementId: "G-X57E5MJ5BR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
