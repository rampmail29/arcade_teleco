/**
 * AppNavigator
 * ÚNICO NavigationContainer de la aplicación.
 *
 * NOTA: sin lógica de autenticación por ahora (ver App.tsx). Renderiza
 * directamente GameNavigator. Cuando un grupo implemente su estrategia de
 * auth, este archivo vuelve a decidir entre AuthNavigator/GameNavigator
 * según el estado de sesión que ese grupo defina.
 *
 * REGLA CRÍTICA: ningún otro módulo debe crear otro NavigationContainer.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import GameNavigator from './GameNavigator';

export default function AppNavigator(): React.JSX.Element {
  return (
    <NavigationContainer>
      <GameNavigator />
    </NavigationContainer>
  );
}
