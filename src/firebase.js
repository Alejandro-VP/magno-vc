// src/firebase.js (ejemplo)
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDHUqjOP5338am_v5ae7CFW6Y-pvDzNOAo",
    authDomain: "magno-vc.firebaseapp.com",
    projectId: "magno-vc",
    storageBucket: "magno-vc.firebasestorage.app",
    messagingSenderId: "483095242852",
    appId: "1:483095242852:web:59b5dfeee64adb9a9f9771",
    measurementId: "G-SPXENWW447"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
