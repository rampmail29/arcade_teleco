/**
 * AuthNavigator
 * Responsabilidad (sección 7): flujo de navegación para usuarios NO autenticados.
 * Inicialmente contiene únicamente: Login.
 *
 * NO debe crear su propio NavigationContainer (solo debe existir uno global,
 * en AppNavigator).
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
