import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameGrid from '../../components/game/GameGrid';
import AppButton from '../../components/common/AppButton';
import { useAuth } from '../../hooks/useAuth';
import { games } from '../../data/games';
import type { RootStackParamList, Game } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props): React.JSX.Element {
  const { user, logout } = useAuth();

  const handleSelectGame = (game: Game): void => {
    navigation.navigate(game.route as keyof RootStackParamList);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ARCADE UTS</Text>
      <Text style={styles.greeting}>Hola, {user?.email}</Text>
      <GameGrid games={games} onSelectGame={handleSelectGame} />
      <AppButton title="Cerrar sesión" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: {},
  greeting: {},
});
