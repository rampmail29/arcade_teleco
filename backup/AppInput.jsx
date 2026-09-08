/**
 * AppInput
 * Componente común reutilizable (no depende de ningún juego específico).
 * Responsabilidad: campo de texto estándar (usado, por ejemplo, en LoginScreen).
 */
import { TextInput, StyleSheet } from 'react-native';

export default function AppInput(props) {
  return <TextInput style={styles.input} {...props} />;
}

const styles = StyleSheet.create({
  input: {},
});
