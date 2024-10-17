// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCW6sKijgc8gdFCkn1J2D3m2zSz9wteG4g",
  authDomain: "programatical.firebaseapp.com",
  databaseURL: "https://programatical-default-rtdb.firebaseio.com",
  projectId: "programatical",
  storageBucket: "programatical.appspot.com",
  messagingSenderId: "330288258955",
  appId: "1:330288258955:web:d9a871979b7ab98e34998e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
