/**
 * App.tsx
 * Punto de entrada. Envuelve AppNavigator con AuthProvider para que
 * useAuth() esté disponible en toda la app (ver AUTH_SUPABASE.md).
 */
import React from 'react';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
