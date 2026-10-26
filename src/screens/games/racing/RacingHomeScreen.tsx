import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameScreenLayout from '../../../components/game/GameScreenLayout';
import AppButton from '../../../components/common/AppButton';
import { getBestScore } from '../../../services/scoreService';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Racing'>;

const INSTRUCTIONS = [
  'Usa los botones ◀ / ▶ o las flechas del teclado.',
  'Esquiva los obstáculos para no perder vidas.',
  'Recoge las monedas ($) para sumar 25 puntos extra.',
  'Tienes 3 vidas antes del fin de la carrera.',
];

export default function RacingHomeScreen({ navigation }: Props): React.JSX.Element {
  const [bestScore, setBestScore] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getBestScore('racing').then((best) => {
        if (active) setBestScore(best);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <GameScreenLayout title="Racing UTS" onBack={() => navigation.popTo('Home')} scrollable>
      <View style={styles.infoCard}>
        <Text style={styles.cardEmoji}>🏎️</Text>
        <Text style={styles.cardBadge}>GAME_06</Text>
        <Text style={styles.cardTitle}>RAMPA UTS RACING</Text>
        <Text style={styles.cardDesc}>
          Pilota tu vehículo a alta velocidad esquivando el tráfico y obstáculos de la rampa.
        </Text>
      </View>

      <View style={styles.statsRow}>
        {[
          ['3', 'CARRILES'],
          ['3', 'VIDAS'],
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

      <AppButton title="▶  JUGAR" onPress={() => navigation.navigate('RacingGame')} />
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
  cardEmoji: {
    fontSize: 54,
    marginBottom: 10,
  },
  cardBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#1A0D30',
    borderWidth: 1,
    borderColor: '#3C2060',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    color: '#A855F7',
    fontSize: 8,
    letterSpacing: 1,
  },
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  cardDesc: { color: '#5A5A72', fontSize: 11, textAlign: 'center', lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  stat: {
    flex: 1,
    backgroundColor: '#0D0D22',
    borderWidth: 1,
    borderColor: '#1E1E38',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  statVal: { color: '#F59E0B', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  statLbl: { color: '#5E5E7A', fontSize: 8, letterSpacing: 1.5, marginTop: 3 },
  rules: {
    backgroundColor: '#0D0D22',
    borderWidth: 1,
    borderColor: '#1E1E38',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    gap: 4,
  },
  rulesTitle: { color: '#A855F7', fontSize: 9, letterSpacing: 2, marginBottom: 4 },
  rule: { color: '#8A8AA3', fontSize: 11, lineHeight: 16 },
});