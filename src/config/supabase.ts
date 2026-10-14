/**
 * config/supabase.ts
 * Inicializa el cliente de Supabase. Único lugar del proyecto que debe
 * importar '@supabase/supabase-js'. Ninguna screen ni componente debe
 * hablar directamente con Supabase: siempre a través de authService.
 */
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from './environment';

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
