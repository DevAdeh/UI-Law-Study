import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDprM86g6-0r4d09hD4hqVIo61avGhOWe0",
  authDomain: "ui-law-study.firebaseapp.com",
  projectId: "ui-law-study",
  storageBucket: "ui-law-study.firebasestorage.app",
  messagingSenderId: "53080585957",
  appId: "1:53080585957:web:ff7fe1aaf4072b5cee460c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);