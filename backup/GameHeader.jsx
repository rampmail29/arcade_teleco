/**
 * GameHeader
 * Responsabilidad: encabezado común reutilizable entre pantallas de juego
 * (título del juego, puntaje actual, navegación de regreso, etc.).
 */
import { View, Text, StyleSheet } from 'react-native';

export default function GameHeader({ title }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {},
  title: {},
});
