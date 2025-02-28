// src/firebase.js

// Importa las funciones que necesitas de cada servicio de Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuración de tu proyecto Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDHUqjOP5338am_v5ae7CFW6Y-pvDzNOAo",
    authDomain: "magno-vc.firebaseapp.com",
    projectId: "magno-vc",
    storageBucket: "magno-vc.firebasestorage.app",
    messagingSenderId: "483095242852",
    appId: "1:483095242852:web:59b5dfeee64adb9a9f9771",
    measurementId: "G-SPXENWW447"
};

// Inicializa la app
const app = initializeApp(firebaseConfig);

// Opcional: si usas Analytics
const analytics = getAnalytics(app);

// Inicializa Firestore y Auth con la nueva sintaxis
const db = getFirestore(app);
const auth = getAuth(app);

// Exporta lo que necesites
export { app, db, auth, analytics };
