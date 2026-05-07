import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCeoCKcxmVjz_8TTFZXkf0JIgnmttYT7wA",
  authDomain: "fenix-presupuestos.firebaseapp.com",
  projectId: "fenix-presupuestos",
  storageBucket: "fenix-presupuestos.firebasestorage.app",
  messagingSenderId: "1059804034387",
  appId: "1:1059804034387:web:42400bff710ab86cd01da6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
