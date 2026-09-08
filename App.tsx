/**
 * App.tsx
 * Punto de entrada.
 *
 * NOTA: no incluye estrategia de autenticación por diseño. Cada grupo de
 * trabajo implementará su propia estrategia (Firebase, backend propio,
 * OAuth, etc.) en fases posteriores del curso. Cuando eso ocurra, aquí se
 * reintroduce el/los provider(s) correspondientes envolviendo AppNavigator.
 */
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';

export default function App(): React.JSX.Element {
  return <AppNavigator />;
}
