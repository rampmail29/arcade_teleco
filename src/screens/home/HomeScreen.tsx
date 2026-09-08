/**
 * HomeScreen (Game Hub)
 * Pantalla principal. Presenta ARCADE UTS y el GameGrid (catálogo de
 * src/data/games.js).
 *
 * NOTA: sin usuario autenticado por ahora (ver App.tsx / AppNavigator.tsx).
 * Cuando exista una estrategia de auth, este componente puede volver a
 * consumir el hook/context correspondiente para mostrar el usuario y un
 * botón de cierre de sesión.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameGrid from '../../components/game/GameGrid';
import { games } from '../../data/games';
import type { RootStackParamList, Game } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props): React.JSX.Element {
  const handleSelectGame = (game: Game): void => {
    navigation.navigate(game.route as keyof RootStackParamList);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ARCADE UTS</Text>
      <GameGrid games={games} onSelectGame={handleSelectGame} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: {},
});
