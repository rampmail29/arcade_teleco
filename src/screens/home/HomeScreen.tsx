import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameGrid from '../../components/game/GameGrid';
import GameHeader from '../../components/game/GameHeader';
import { games } from '../../data/games';
import type { RootStackParamList, Game } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props): React.JSX.Element {
  const handleSelectGame = (game: Game): void => {
    navigation.navigate(game.route as keyof RootStackParamList);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <GameHeader title="Game Hub" />
      <View style={styles.container}>
        <View style={styles.scoreBar}>
          {[
            ['HI-SCORE', '012500'], // score de ejemplo, modificar si ya se obtiene.
            ['GAMES', String(games.length).padStart(2, '0')],
            ['STATUS', 'READY'],
          ].map(([label, val]) => (
            <View key={label} style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>{label}</Text>
              <Text style={[styles.scoreVal, label === 'STATUS' && styles.scoreValCyan]}>
                {val}
              </Text>
            </View>
          ))}
        </View>
        <GameGrid games={games} onSelectGame={handleSelectGame} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#07071A',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  scoreBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0D0D22',
    borderWidth: 1,
    borderColor: '#1E1E38',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  scoreItem: { alignItems: 'center' },
  scoreLabel: { color: '#5E5E7A', fontSize: 8, letterSpacing: 2 },
  scoreVal: { color: '#F59E0B', fontSize: 13, letterSpacing: 1, marginTop: 2 },
  scoreValCyan: { color: '#22D3EE' },
});