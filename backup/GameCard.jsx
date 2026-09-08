/**
 * GameCard
 * Componente común al concepto de "juego" (no común a toda la app: vive en /game).
 * Responsabilidad: representar un juego dentro del GameGrid del Game Hub.
 * Recibe props (no debe tener lógica de negocio ni llamadas a servicios):
 *   - title, description, icon, route, onPress
 */
import { Pressable, Text, StyleSheet } from 'react-native';

export default function GameCard({ title, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {},
  title: {},
});
