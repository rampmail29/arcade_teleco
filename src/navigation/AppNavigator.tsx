/**
 * AppNavigator
 * ÚNICO NavigationContainer de la aplicación.
 *
 * Decide el flujo activo según el estado de sesión de useAuth():
 * no autenticado -> AuthNavigator, autenticado -> GameNavigator. Mientras
 * se restaura la sesión inicial (loading === true) muestra Loading.
 *
 * REGLA CRÍTICA: ningún otro módulo debe crear otro NavigationContainer.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/common/Loading';
import AuthNavigator from './AuthNavigator';
import GameNavigator from './GameNavigator';

export default function AppNavigator(): React.JSX.Element {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <NavigationContainer>
      {isAuthenticated ? <GameNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
