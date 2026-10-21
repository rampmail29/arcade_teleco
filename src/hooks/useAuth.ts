/**
 * hooks/useAuth.ts
 * Punto único de acceso a la autenticación para cualquier screen o
 * componente: const { user, isAuthenticated, login, logout } = useAuth();
 */
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
