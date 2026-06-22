// src/services/firebase/config.js
//
// Inicialización central de Firebase. Este es el ÚNICO lugar del proyecto
// donde se debe llamar a initializeApp(). Todo lo demás importa desde aquí.
//
// Variables de entorno requeridas (.env.local — NUNCA commitear este archivo):
//   VITE_FIREBASE_API_KEY=
//   VITE_FIREBASE_AUTH_DOMAIN=
//   VITE_FIREBASE_PROJECT_ID=
//   VITE_FIREBASE_STORAGE_BUCKET=
//   VITE_FIREBASE_MESSAGING_SENDER_ID=
//   VITE_FIREBASE_APP_ID=
//
// Vite expone solo las variables prefijadas con VITE_ al cliente vía import.meta.env

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validación temprana: si falta alguna variable, falla rápido y claro
// en vez de un error críptico de Firebase SDK más adelante.
if (import.meta.env.DEV) {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error(
      `[Firebase Config] Faltan variables de entorno: ${missing.join(', ')}.\n` +
      `Revisa tu archivo .env.local`
    );
  }
}

// getApps()/getApp() evita la re-inicialización en hot-reload (Vite HMR),
// que de otro modo lanza "Firebase App named '[DEFAULT]' already exists".
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
