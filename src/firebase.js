// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDHUqjOP5338am_v5ae7CFW6Y-pvDzNOAo",
    authDomain: "magno-vc.firebaseapp.com",
    projectId: "magno-vc",
    storageBucket: "magno-vc.firebasestorage.app",
    messagingSenderId: "483095242852",
    appId: "1:483095242852:web:59b5dfeee64adb9a9f9771",
    measurementId: "G-SPXENWW447"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = firebase.firestore();
const auth = firebase.auth();

export { firebase, db, auth };