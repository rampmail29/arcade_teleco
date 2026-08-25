/**
 * AppButton
 * Componente común reutilizable (no depende de ningún juego específico).
 * Responsabilidad: botón estándar de la aplicación con estilos consistentes.
 *
 * TODO (Corte 1): implementar variantes (primary/secondary), estado disabled
 * y estado de loading, usando StyleSheet (no se usa librería visual externa).
 */
import { Pressable, Text, StyleSheet } from 'react-native';

export default function AppButton({ title, onPress, disabled = false }) {
  return (
    <Pressable style={styles.button} onPress={onPress} disabled={disabled}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {},
  text: {},
});
