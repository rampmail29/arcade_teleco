/**
 * AppNavigator
 * Responsabilidad (sección 7/8): ÚNICO NavigationContainer de la aplicación.
 * Decide qué flujo está activo según isAuthenticated:
 *
 *   No autenticado -> AuthNavigator
 *   Autenticado     -> GameNavigator
 *
 * Debe manejar el estado `loading` durante la restauración inicial de sesión
 * (ver AuthContext) antes de decidir qué navegador mostrar.
 *
 * REGLA CRÍTICA (sección 18): ningún otro módulo debe crear otro
 * NavigationContainer.
 */
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import GameNavigator from './GameNavigator';
import Loading from '../components/common/Loading';

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <GameNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
