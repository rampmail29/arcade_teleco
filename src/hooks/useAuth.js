/**
 * useAuth
 * Responsabilidad (sección 10): hook que encapsula el acceso a AuthContext.
 * Permite: const { user, isAuthenticated, login, logout } = useAuth();
 *
 * No crear hooks innecesarios (regla explícita del documento de especificación).
 */
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
