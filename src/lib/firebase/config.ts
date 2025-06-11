
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore"; // Adicionado import do Firestore

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvuYtZSWxyjm5ss4y8sNRbH1J3bjRDXMw",
  authDomain: "chega-ai-v1.firebaseapp.com",
  projectId: "chega-ai-v1",
  storageBucket: "chega-ai-v1.firebasestorage.app",
  messagingSenderId: "1041249778153",
  appId: "1:1041249778153:web:109f0c199dc8ee655ff378",
  measurementId: "G-CFRSH45HX4"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore; // Declarada a variável db

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}
auth = getAuth(app);
db = getFirestore(app); // Inicializado o Firestore

export { app, auth, db, firebaseConfig }; // Exportado o db
