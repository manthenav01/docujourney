import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBUKytxsHUuuqsr5sbAZOZ04WKBYuhXbos",
  authDomain: "doctracker-b4528.firebaseapp.com",
  projectId: "doctracker-b4528",
  storageBucket: "doctracker-b4528.firebasestorage.app",
  messagingSenderId: "213026976072",
  appId: "1:213026976072:web:40ff129938660330e3037d",
  measurementId: "G-WGK0Z3JVF8"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
