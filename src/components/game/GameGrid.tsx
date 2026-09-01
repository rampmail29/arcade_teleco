import React from 'react';
import { View, StyleSheet } from 'react-native';
import GameCard from './GameCard';
import type { Game } from '../../types';

interface GameGridProps {
  games: Game[];
  onSelectGame: (game: Game) => void;
}

export default function GameGrid({ games = [], onSelectGame }: GameGridProps): React.JSX.Element {
  return (
    <View style={styles.grid}>
      {games.map((game) => (
        <GameCard key={game.id} title={game.title} onPress={() => onSelectGame(game)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
