/**
 * HomeScreen (Game Hub)
 * Pantalla principal. Presenta ARCADE UTS, el usuario autenticado, el
 * GameGrid (catálogo de src/data/games.ts) y el cierre de sesión.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      {user?.email && <Text style={styles.greeting}>Hola, {user.email}</Text>}
      <GameGrid games={games} onSelectGame={handleSelectGame} />
      <View style={styles.logout}>
        <AppButton title="Cerrar sesión" variant="secondary" onPress={() => logout()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#4f46e5' },
  greeting: { fontSize: 15, color: '#6b7280', marginTop: 4, marginBottom: 16 },
  logout: { marginTop: 24 },
});
