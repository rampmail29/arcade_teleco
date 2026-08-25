/**
 * Game4ResultScreen
 * Responsabilidad: pantalla de resultado de "Game4" (puntaje final,
 * opción de volver a jugar o regresar al Game Hub).
 */
import { View, Text, StyleSheet } from 'react-native';
import AppButton from '../../../components/common/AppButton';

export default function Game4ResultScreen({ navigation, route }) {
  const { score = 0 } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultado — Game4</Text>
      <Text>Puntaje final: {score}</Text>
      <AppButton title="Volver al Game Hub" onPress={() => navigation.navigate('Home')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: {},
});
