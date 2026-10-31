import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameScreenLayout from '../../../components/game/GameScreenLayout';
import AppButton from '../../../components/common/AppButton';
import { getBestScore } from '../../../services/scoreService';
import { GAME_ID, GRID } from './logic/buscaminasConfig';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Buscaminas'>;

const INSTRUCTIONS = [
  'Toca una celda para revelarla.',
  'El número indica cuántas minas hay en las celdas vecinas.',
  'Si tocas una mina, pierdes y se revela todo el tablero.',
  'Ganas cuando revelas todas las celdas que no tienen mina.',
];

export default function BuscaminasHomeScreen({ navigation }: Props): React.JSX.Element {
  const [bestScore, setBestScore] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getBestScore(GAME_ID).then((best) => {
        if (active) setBestScore(best);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <GameScreenLayout title="Buscaminas" onBack={() => navigation.popTo('Home')} scrollable>
      <View style={styles.infoCard}>
        <Text style={styles.cardBadge}>GAME_08</Text>
        <Text style={styles.cardTitle}>BUSCAMINAS</Text>
        <Text style={styles.cardDesc}>
          Encuentra todas las celdas seguras sin detonar ninguna mina.
        </Text>
      </View>

      <View style={styles.statsRow}>
        {[
          [`${GRID.rows}×${GRID.cols}`, 'GRILLA'],
          [String(GRID.mines).padStart(2, '0'), 'MINAS'],
          [String(bestScore).padStart(4, '0'), 'RÉCORD'],
        ].map(([val, lbl]) => (
          <View key={lbl} style={styles.stat}>
            <Text style={styles.statVal}>{val}</Text>
            <Text style={styles.statLbl}>{lbl}</Text>
          </View>
        ))}
      </View>

      <View style={styles.rules}>
        <Text style={styles.rulesTitle}>CÓMO JUGAR</Text>
        {INSTRUCTIONS.map((rule) => (
          <Text key={rule} style={styles.rule}>▸ {rule}</Text>
        ))}
      </View>

      <AppButton title="▶  JUGAR" onPress={() => navigation.navigate('BuscaminasGame')} />
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: '#0D0D22',
    borderWidth: 1,
    borderColor: '#232340',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  cardBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: '#1A0D30', borderWidth: 1, borderColor: '#3C2060',
    borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
    color: '#A855F7', fontSize: 8, letterSpacing: 1,
  },
  cardTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 3, marginBottom: 8, marginTop: 8 },
  cardDesc: { color: '#5A5A72', fontSize: 11, textAlign: 'center', lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  stat: {
    flex: 1, backgroundColor: '#0D0D22',
    borderWidth: 1, borderColor: '#1E1E38',
    borderRadius: 10, padding: 10, alignItems: 'center',
  },
  statVal: { color: '#F59E0B', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  statLbl: { color: '#5E5E7A', fontSize: 8, letterSpacing: 1.5, marginTop: 3 },
  rules: {
    backgroundColor: '#0D0D22',
    borderWidth: 1, borderColor: '#1E1E38',
    borderRadius: 10, padding: 12, marginBottom: 14, gap: 4,
  },
  rulesTitle: { color: '#A855F7', fontSize: 9, letterSpacing: 2, marginBottom: 4 },
  rule: { color: '#8A8AA3', fontSize: 11, lineHeight: 16 },
});
