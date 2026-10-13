import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameScreenLayout from '../../../components/game/GameScreenLayout';
import AppButton from '../../../components/common/AppButton';
import { getBestScore } from '../../../services/scoreService';
import { GAME_ID } from './logic/robotRunConfig';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RobotRun'>;

const INSTRUCTIONS = [
  'Toca la pantalla para saltar.',
  'Esquiva los obstáculos: un choque termina la partida.',
  'Sumas puntos por tiempo y por cada obstáculo superado.',
  'Cada 100 puntos el robot corre más rápido.',
];

export default function RobotRunHomeScreen({ navigation }: Props): React.JSX.Element {
  const [bestScore, setBestScore] = useState(0);

  // Se recarga al volver a esta pantalla para mostrar el récord actualizado.
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
    <GameScreenLayout title="Robot Run" onBack={() => navigation.popTo('Home')} scrollable>
      <View style={styles.infoCard}>
        <Image source={require('../../../../assets/images/robotrun.png')} style={styles.icon} />
        <Text style={styles.cardBadge}>GAME_05</Text>
        <Text style={styles.cardTitle}>ROBOT RUN</Text>
        <Text style={styles.cardDesc}>
          Un robot corre sin parar. Ayúdalo a saltar los obstáculos y llega lo más lejos posible.
        </Text>
      </View>

      <View style={styles.statsRow}>
        {[['TAP', 'SALTAR'], ['∞', 'NIVELES'], [String(bestScore).padStart(4, '0'), 'RÉCORD']].map(([val, lbl]) => (
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

      <AppButton title="▶  JUGAR" onPress={() => navigation.navigate('RobotRunGame')} />
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
  icon: {
    width: 80,
    height: 80,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  cardBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: '#1A0D30', borderWidth: 1, borderColor: '#3C2060',
    borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
    color: '#A855F7', fontSize: 8, letterSpacing: 1,
  },
  cardTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 3, marginBottom: 8 },
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
