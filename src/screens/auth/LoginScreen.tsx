/**
 * screens/auth/LoginScreen.tsx
 * Pantalla única de acceso: login y registro con correo/contraseña. Usa
 * useAuth() exclusivamente; no importa Supabase ni authService directamente
 * (regla de la arquitectura, ver AUTH_SUPABASE.md).
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import Notification from '../../components/common/Notification';
import Loading from '../../components/common/Loading';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail, isValidPassword } from '../../utils/validators';
import { APP_NAME } from '../../utils/constants';

type Mode = 'login' | 'register';

export default function LoginScreen(): React.JSX.Element {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (next: Mode): void => {
    setMode(next);
    setNotice(null);
  };

  const handleSubmit = async (): Promise<void> => {
    setNotice(null);
    if (!isValidEmail(email)) {
      setNotice({ type: 'error', message: 'Ingresa un correo válido.' });
      return;
    }
    if (!isValidPassword(password)) {
      setNotice({ type: 'error', message: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
        setNotice({ type: 'success', message: 'Cuenta creada. Ya puedes iniciar sesión.' });
        setMode('login');
      }
    } catch (e) {
      setNotice({ type: 'error', message: e instanceof Error ? e.message : 'Ocurrió un error inesperado.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) return <Loading />;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.brand}>{APP_NAME}</Text>

        <AppCard>
          <Text style={styles.title}>{mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}</Text>
          <Text style={styles.subtitle}>
            {mode === 'login' ? 'Ingresa con tu correo y contraseña.' : 'Regístrate para empezar a jugar.'}
          </Text>

          <View style={styles.form}>
            <AppInput
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <AppInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          {notice && <Notification type={notice.type} message={notice.message} />}

          <View style={styles.actions}>
            <AppButton title={mode === 'login' ? 'Ingresar' : 'Registrarme'} onPress={handleSubmit} />
          </View>

          <Text style={styles.toggle} onPress={() => switchMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </Text>
        </AppCard>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f3f4f6', gap: 24 },
  brand: { fontSize: 32, fontWeight: '800', textAlign: 'center', color: '#4f46e5' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  form: { gap: 12 },
  actions: { marginTop: 16 },
  toggle: { textAlign: 'center', marginTop: 16, color: '#4f46e5', fontWeight: '600' },
});
