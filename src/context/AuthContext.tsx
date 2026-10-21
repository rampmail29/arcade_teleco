/**
 * context/AuthContext.tsx
 * Estado global de autenticación. Expone { user, isAuthenticated, loading,
 * login, register, logout }. No contiene UI. AppNavigator decide el flujo
 * (Auth vs Game) según `isAuthenticated` + `loading`.
 */
import React, { createContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { authService } from '../services/authService';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getSession().then((s) => {
      setSession(s);
      setLoading(false);
    });
    return authService.onAuthStateChange(setSession);
  }, []);

  const value: AuthContextValue = {
    user: session?.user ?? null,
    isAuthenticated: !!session,
    loading,
    login: async (email, password) => {
      await authService.login(email, password);
    },
    register: async (email, password) => {
      await authService.register(email, password);
    },
    logout: authService.logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
