// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCX3hHXx_AV8mXUt2yeyNbBh5GIWBHqhn8",
  authDomain: "shoplah-orbital.firebaseapp.com",
  projectId: "shoplah-orbital",
  storageBucket: "shoplah-orbital.firebasestorage.app",
  messagingSenderId: "268393766948",
  appId: "1:268393766948:web:2c265d19e02cceb43378b1",
  measurementId: "G-7SE1LNWWJP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth();
export const db=getFirestore(app);
export default app;