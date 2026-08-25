/**
 * LoginScreen
 * Responsabilidad: pantalla de inicio de sesión.
 *
 * Flujo de autenticación obligatorio (sección 12):
 *   LoginScreen -> useAuth() -> AuthContext -> authService -> Firebase Authentication
 *
 * Reglas (sección 6 y 18):
 *   - NO debe llamar directamente a Firebase.
 *   - NO debe hacer fetch()/HTTP directo.
 *   - Toda la lógica de login vive en useAuth()/authService.
 */
import { View, StyleSheet } from 'react-native';
import { useState } from 'react';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <View style={styles.container}>
      <AppInput placeholder="Correo" value={email} onChangeText={setEmail} />
      <AppInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
      <ErrorMessage message={error} />
      <AppButton title="Ingresar" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
});
