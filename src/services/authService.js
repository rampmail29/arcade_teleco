/**
 * authService
 * Responsabilidad (sección 11/12): encapsular Firebase Authentication.
 * login, logout, observación del estado (registro/recuperación de contraseña
 * se agregarán posteriormente si se requieren).
 *
 * Las screens NO deben importar directamente funciones de Firebase: siempre
 * pasan por este servicio (Screen -> useAuth -> AuthContext -> authService).
 *
 * NO almacenar contraseñas manualmente en AsyncStorage.
 * NO usar Firestore como base de datos principal del proyecto.
 */
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export async function loginWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}
