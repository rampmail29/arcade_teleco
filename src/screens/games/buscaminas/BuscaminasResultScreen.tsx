import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameScreenLayout from '../../../components/game/GameScreenLayout';
import AppButton from '../../../components/common/AppButton';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'BuscaminasResult'>;

export default function BuscaminasResultScreen({ navigation, route }: Props): React.JSX.Element {
  const { score, cellsRevealed, won, bestScore, isNewRecord } = route.params;
  const goToHub = (): void => navigation.popTo('Home');

  return (
    <GameScreenLayout title="Resultado" status="END" onBack={goToHub}>
      <View style={styles.center}>
        <Text style={styles.trophy}>{isNewRecord ? '🏆' : won ? '🚩' : '💣'}</Text>
        <Text style={styles.label}>PUNTAJE FINAL</Text>
        <Text style={styles.score}>{String(score).padStart(3, '0')}</Text>
        <View style={[styles.badge, isNewRecord && styles.badgeRecord]}>
          <Text style={[styles.badgeTxt, isNewRecord && styles.badgeTxtRecord]}>
            {isNewRecord ? '★ NUEVO RÉCORD ★' : won ? '¡TABLERO LIMPIO!' : 'TOCASTE UNA MINA'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          {[
            [String(cellsRevealed), 'CELDAS SEGURAS'],
            [String(bestScore).padStart(4, '0'), 'RÉCORD'],
          ].map(([val, lbl]) => (
            <View key={lbl} style={styles.stat}>
              <Text style={styles.statVal}>{val}</Text>
              <Text style={styles.statLbl}>{lbl}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton title="↻  REINTENTAR" onPress={() => navigation.replace('BuscaminasGame')} />
        <AppButton title="⌂  VOLVER AL HUB" variant="secondary" onPress={goToHub} />
      </View>
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  trophy: { fontSize: 52 },
  label: { color: '#5E5E7A', fontSize: 9, letterSpacing: 3 },
  score: { color: '#F59E0B', fontSize: 52, fontWeight: '900', letterSpacing: 4 },
  badge: {
    backgroundColor: '#0D0D22', borderWidth: 1, borderColor: '#2A2A4A',
    borderRadius: 20, paddingHorizontal: 20, paddingVertical: 5,
  },
  badgeRecord: { backgroundColor: '#1A0D30', borderColor: '#A855F7' },
  badgeTxt: { color: '#5E5E7A', fontSize: 11, letterSpacing: 2 },
  badgeTxtRecord: { color: '#A855F7' },
  statsRow: { flexDirection: 'row', gap: 8, width: '100%' },
  stat: {
    flex: 1, backgroundColor: '#0D0D22',
    borderWidth: 1, borderColor: '#1E1E38',
    borderRadius: 10, padding: 10, alignItems: 'center',
  },
  statVal: { color: '#22D3EE', fontSize: 13, fontWeight: '900' },
  statLbl: { color: '#5E5E7A', fontSize: 7, letterSpacing: 1.5, marginTop: 3 },
  actions: { gap: 10 },
});
