import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Evita reinicializar si ya existe (hot reload)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// getAuth() en vez de initializeAuth() — compatible con Expo 57 / RN 0.86.
// La persistencia en memoria es suficiente para Expo Go; AsyncStorage se
// configura aparte si se necesita persistencia entre reinicios de la app.
export const auth: Auth = getAuth(app);
