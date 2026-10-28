/**
 * services/authService.ts
 * Encapsula toda la autenticación (Supabase). Es la única capa autorizada
 * a llamar métodos de `supabase.auth`. AuthContext consume este servicio;
 * las screens no deben importar `supabase` ni este archivo directamente,
 * sino usar el hook `useAuth`.
 */
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

async function register(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
}

async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export const authService = {
  login,
  register,
  logout,
  getSession,
  onAuthStateChange,
};
