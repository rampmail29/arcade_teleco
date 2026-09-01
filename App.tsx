/**
 * App.tsx
 * Punto de entrada. Monta el ÚNICO AuthProvider y el ÚNICO AppNavigator
 * (que a su vez contiene el ÚNICO NavigationContainer de la aplicación).
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
