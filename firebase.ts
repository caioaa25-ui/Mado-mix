
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Tenta obter das variáveis de ambiente (padrão Vite/Netlify) ou usa os valores fixos fornecidos
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "AIzaSyATJlXNiurZDyoC1hHrwV5QvLB6uQ9GvqI",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "moda-27cd3.firebaseapp.com",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "moda-27cd3",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "moda-27cd3.firebasestorage.app",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "412538139426",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "1:412538139426:web:4a3ee23c5981dcb712ab7b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
