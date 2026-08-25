/**
 * AuthContext
 * Responsabilidad (sección 9): compartir el estado global de autenticación.
 * NO contiene componentes visuales.
 *
 * Expone conceptualmente: { user, isAuthenticated, loading, login, logout }
 *
 * Flujo (sección 12):
 *   AuthContext -> authService -> Firebase Authentication
 */
import { createContext, useEffect, useState } from 'react';
import { loginWithEmail, logout as logoutService, subscribeToAuthChanges } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Observa el estado de Firebase Authentication (restauración de sesión).
    const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const loggedUser = await loginWithEmail(email, password);
    setUser(loggedUser);
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
