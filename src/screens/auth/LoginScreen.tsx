import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen(): React.JSX.Element {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (): Promise<void> => {
    try {
      await login(email, password);
    } catch (e) {
      setError((e as Error).message);
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
