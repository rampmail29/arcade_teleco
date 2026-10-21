/**
 * AuthNavigator
 * Flujo de pantallas para usuarios NO autenticados. Montado por
 * AppNavigator cuando isAuthenticated === false.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';

export type AuthStackParamList = {
  Login: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
