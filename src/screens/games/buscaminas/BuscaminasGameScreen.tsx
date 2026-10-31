import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameScreenLayout from '../../../components/game/GameScreenLayout';
import { useBuscaminas } from '../../../hooks/useBuscaminas';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'BuscaminasGame'>;

const NUMBER_COLORS: Record<number, string> = {
  1: '#22D3EE',
  2: '#4ADE80',
  3: '#F59E0B',
  4: '#A855F7',
  5: '#EC4899',
  6: '#22D3EE',
  7: '#FFF',
  8: '#5E5E7A',
};

export default function BuscaminasGameScreen({ navigation }: Props): React.JSX.Element {
  const { state, bestScore, revealCell } = useBuscaminas({
    onGameOver: (result) => navigation.replace('BuscaminasResult', result),
  });

  const ended = state.phase !== 'playing';

  return (
    <GameScreenLayout title="Buscaminas" status={ended ? 'END' : 'LIVE'} onBack={() => navigation.popTo('Home')}>
      <View style={styles.hud}>
        {[
          ['SCORE', String(state.score).padStart(3, '0'), '#22D3EE'],
          ['SEGURAS', String(state.revealedSafeCount).padStart(3, '0'), '#F59E0B'],
          ['RÉCORD', String(Math.max(bestScore, state.score)).padStart(4, '0'), '#EC4899'],
        ].map(([lbl, val, color]) => (
          <View key={lbl} style={styles.hudItem}>
            <Text style={[styles.hudVal, { color }]}>{val}</Text>
            <Text style={styles.hudLbl}>{lbl}</Text>
          </View>
        ))}
      </View>

      <View style={styles.board}>
        {state.grid.map((rowCells, row) => (
          <View key={row} style={styles.row}>
            {rowCells.map((cell, col) => {
              const showMine = cell.revealed && cell.mine;
              const showNumber = cell.revealed && !cell.mine && cell.adjacent > 0;
              return (
                <Pressable
                  key={col}
                  style={[styles.cell, cell.revealed && styles.cellRevealed]}
                  onPress={() => revealCell(row, col)}
                  disabled={ended || cell.revealed}
                >
                  {showMine && <Text style={styles.mine}>💣</Text>}
                  {showNumber && (
                    <Text style={[styles.number, { color: NUMBER_COLORS[cell.adjacent] ?? '#FFF' }]}>
                      {cell.adjacent}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <Text style={styles.footer}>Toca una celda · el número dice cuántas minas la rodean</Text>
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  hud: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  hudItem: {
    flex: 1, backgroundColor: '#0D0D22',
    borderWidth: 1, borderColor: '#1E1E38',
    borderRadius: 8, padding: 8, alignItems: 'center',
  },
  hudVal: { fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  hudLbl: { color: '#5E5E7A', fontSize: 7, letterSpacing: 1.5, marginTop: 2 },
  board: {
    backgroundColor: '#0D0D22',
    borderWidth: 1, borderColor: '#232340',
    borderRadius: 14, padding: 6, marginBottom: 12,
  },
  row: { flexDirection: 'row' },
  cell: {
    flex: 1, aspectRatio: 1, margin: 2,
    backgroundColor: '#11112A',
    borderWidth: 1, borderColor: '#232340',
    borderRadius: 4, alignItems: 'center', justifyContent: 'center',
  },
  cellRevealed: { backgroundColor: '#07071A', borderColor: '#1E1E38' },
  mine: { fontSize: 14 },
  number: { fontSize: 13, fontWeight: '900' },
  footer: { color: '#3C3C5C', fontSize: 9, letterSpacing: 1, textAlign: 'center' },
});
