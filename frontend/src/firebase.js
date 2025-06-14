// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
 apiKey: "AIzaSyDQw9YcDp3DiqpNf_qvlYOXqtZsNASQ5wk",
  authDomain: "calm----asana.firebaseapp.com",
  projectId: "calm----asana",
  storageBucket: "calm----asana.firebasestorage.app",
  messagingSenderId: "560144960579",
  appId: "1:560144960579:web:8fdab9d2ee7b21807b98f6",
  measurementId: "G-FRBGP7ZG7J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);