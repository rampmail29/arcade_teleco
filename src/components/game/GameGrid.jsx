/**
 * GameGrid
 * Responsabilidad: renderizar la cuadrícula de juegos a partir del catálogo
 * central (src/data/games.js). NO codificar manualmente cada botón de juego
 * (ver sección 15/16 del documento de especificación).
 */
import { View, StyleSheet } from 'react-native';
import GameCard from './GameCard';

export default function GameGrid({ games = [], onSelectGame }) {
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
