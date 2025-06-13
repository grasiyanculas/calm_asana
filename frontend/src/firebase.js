// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA8aZhUBQXTNSgltYGp_xccEEv4IVBbM5o",
  authDomain: "calmasana-dc908.firebaseapp.com",
  projectId: "calmasana-dc908",
  storageBucket: "calmasana-dc908.firebasestorage.app",
  messagingSenderId: "666845426711",
  appId: "1:666845426711:web:247a089b538aec3cac5852"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);