import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameScreenLayout from '../../../components/game/GameScreenLayout';
import AppButton from '../../../components/common/AppButton';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'SudokuResult'>;

function getRank(score: number): string {
  if (score >= 900) return 'S+';
  if (score >= 700) return 'A+';
  if (score >= 500) return 'B';
  if (score >= 300) return 'C';
  return 'D';
}

export default function SudokuResultScreen({ navigation, route }: Props): React.JSX.Element {
  const { score = 0 } = route.params;
  const rank = getRank(score);

  return (
    <GameScreenLayout title="Resultado" status="END">
      <View style={styles.center}>
        <View style={styles.pixelRow}>
          {['#A855F7', '#22D3EE', '#F59E0B', '#22D3EE', '#A855F7'].map((c, i) => (
            <View key={i} style={[styles.pixel, { backgroundColor: c }]} />
          ))}
        </View>

        <Text style={styles.trophy}>🧩</Text>
        <Text style={styles.label}>PUNTAJE FINAL</Text>
        <Text style={styles.score}>{String(score).padStart(4, '0')}</Text>
        <View style={styles.rankBadge}>
          <Text style={styles.rankTxt}>RANK: {rank}</Text>
        </View>

        <View style={styles.statsRow}>
          {[['SUDOKU', 'JUEGO'], [rank, 'RANGO'], ['TOP', 'POSICIÓN']].map(([val, lbl]) => (
            <View key={lbl} style={styles.stat}>
              <Text style={styles.statVal}>{val}</Text>
              <Text style={styles.statLbl}>{lbl}</Text>
            </View>
          ))}
        </View>
      </View>

      <AppButton
        title="⌂  VOLVER AL HUB"
        variant="secondary"
        onPress={() => navigation.navigate('Home')}
      />
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  pixelRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  pixel: { width: 6, height: 6, borderRadius: 2 },
  trophy: { fontSize: 52 },
  label: { color: '#5E5E7A', fontSize: 9, letterSpacing: 3 },
  score: { color: '#F59E0B', fontSize: 52, fontWeight: '900', letterSpacing: 4 },
  rankBadge: {
    backgroundColor: '#1A0D30', borderWidth: 1, borderColor: '#A855F7',
    borderRadius: 20, paddingHorizontal: 20, paddingVertical: 5,
  },
  rankTxt: { color: '#A855F7', fontSize: 11, letterSpacing: 2 },
  statsRow: { flexDirection: 'row', gap: 8, width: '100%' },
  stat: {
    flex: 1, backgroundColor: '#0D0D22',
    borderWidth: 1, borderColor: '#1E1E38',
    borderRadius: 10, padding: 10, alignItems: 'center',
  },
  statVal: { color: '#22D3EE', fontSize: 13, fontWeight: '900' },
  statLbl: { color: '#5E5E7A', fontSize: 7, letterSpacing: 1.5, marginTop: 3 },
});