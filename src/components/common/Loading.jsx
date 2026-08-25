/**
 * Loading
 * Componente común reutilizable.
 * Responsabilidad: representar visualmente el estado "loading" (ver sección 22
 * del documento de especificación: loading es parte del estado global de auth
 * y también se usa localmente en pantallas con datos asíncronos).
 */
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Loading() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
