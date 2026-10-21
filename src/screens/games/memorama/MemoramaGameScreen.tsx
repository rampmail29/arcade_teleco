import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameScreenLayout from '../../../components/game/GameScreenLayout';
import AppButton from '../../../components/common/AppButton';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'MemoramaGame'>;

export default function MemoramaGameScreen({ navigation }: Props): React.JSX.Element {
  const [score, setScore] = useState(0);

  return (
    <GameScreenLayout title="Memorama" status="LIVE">
      <View style={styles.hud}>
        {[
          ['SCORE',  String(score).padStart(4, '0'), '#22D3EE'],
          ['PARES',  '0/8',                          '#A855F7'],
          ['TIEMPO', '60s',                          '#EC4899'],
        ].map(([lbl, val, color]) => (
          <View key={lbl} style={styles.hudItem}>
            <Text style={[styles.hudVal, { color }]}>{val}</Text>
            <Text style={styles.hudLbl}>{lbl}</Text>
          </View>
        ))}
      </View>

      <View style={styles.gameArea}>
        <Text style={styles.gameAreaIcon}>◈</Text>
        <Text style={styles.gameAreaTxt}>ÁREA DEL JUEGO</Text>
      </View>

      <AppButton
        title="■  FINALIZAR"
        variant="danger"
        onPress={() => navigation.navigate('MemoramaResult', { score })}
      />
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
  gameArea: {
    flex: 1, backgroundColor: '#0D0D22',
    borderWidth: 1, borderColor: '#232340',
    borderRadius: 14, marginBottom: 12,
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  gameAreaIcon: { fontSize: 40, color: '#2A2A4A' },
  gameAreaTxt: { color: '#3C3C5C', fontSize: 10, letterSpacing: 2 },
});