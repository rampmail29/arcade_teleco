/**
 * AppCard
 * Componente común reutilizable (no depende de ningún juego específico).
 * Responsabilidad: contenedor visual estándar (card) para agrupar contenido.
 */
import { View, StyleSheet } from 'react-native';

export default function AppCard({ children }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {},
});
