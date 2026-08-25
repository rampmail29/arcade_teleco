/**
 * Game4GameScreen
 * Responsabilidad: pantalla de juego de "Game4" (lógica demostrativa en
 * Corte 1, usando mockData). NO debe hacer fetch()/HTTP directo (sección 6/18).
 *
 * Estado local (sección 22) esperado aquí: score, pregunta/turno actual, etc.
 */
import { View, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import GameHeader from '../../../components/game/GameHeader';
import AppButton from '../../../components/common/AppButton';

export default function Game4GameScreen({ navigation }) {
  const [score, setScore] = useState(0);

  return (
    <View style={styles.container}>
      <GameHeader title="Game4" />
      <Text>Puntaje: {score}</Text>
      <AppButton title="Finalizar" onPress={() => navigation.navigate('Game4Result', { score })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
});
