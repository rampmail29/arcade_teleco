/**
 * firebase.js
 * Responsabilidad (sección 13): inicializar Firebase. La configuración NO
 * debe estar dispersa por las screens.
 *
 * Usa el Firebase JS SDK (compatible con Expo Go), NO React Native Firebase
 * (que requiere código nativo). Ver "Fuentes técnicas verificadas" en el
 * documento de especificación.
 *
 * NO subir secretos privados al repositorio: los valores reales deben venir
 * de variables de entorno (EXPO_PUBLIC_...).
 */
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
