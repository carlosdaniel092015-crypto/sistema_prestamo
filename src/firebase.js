import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAVXRoD5Q1jpN46s5GLpvjD817fFjB9Xg8",
  authDomain: "cesar-prestamo.firebaseapp.com",
  projectId: "cesar-prestamo",
  storageBucket: "cesar-prestamo.firebasestorage.app",
  messagingSenderId: "106656114973",
  appId: "1:106656114973:web:1507f991cea3cbc84699f4",
  measurementId: "G-JH5S5C8PYF"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;
