import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameScreenLayout from '../../../components/game/GameScreenLayout';
import { useRobotRun } from '../../../hooks/useRobotRun';
import RobotFigure from './components/RobotFigure';
import ObstacleFigure from './components/ObstacleFigure';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RobotRunGame'>;

const GROUND_HEIGHT = 28;
const GROUND_TICK_GAP = 36;
const HINT_VISIBLE_MS = 2500;

export default function RobotRunGameScreen({ navigation }: Props): React.JSX.Element {
  const { state, bestScore, jump, quit, onFieldLayout } = useRobotRun({
    onGameOver: (result) => navigation.replace('RobotRunResult', result),
  });

  const handleBack = (): void => {
    quit();
    navigation.popTo('Home');
  };

  const crashed = state?.phase === 'crashed' || state?.phase === 'finished';
  const tickOffset = state ? state.distance % GROUND_TICK_GAP : 0;
  const tickCount = state ? Math.ceil(state.fieldWidth / GROUND_TICK_GAP) + 1 : 0;

  return (
    <GameScreenLayout title="Robot Run" status={crashed ? 'END' : 'LIVE'} onBack={handleBack}>
      <View style={styles.hud}>
        {[
          ['SCORE', String(state?.score ?? 0).padStart(4, '0'), '#22D3EE'],
          ['NIVEL', String((state?.level ?? 0) + 1).padStart(2, '0'), '#F59E0B'],
          ['RÉCORD', String(Math.max(bestScore, state?.score ?? 0)).padStart(4, '0'), '#EC4899'],
        ].map(([lbl, val, color]) => (
          <View key={lbl} style={styles.hudItem}>
            <Text style={[styles.hudVal, { color }]}>{val}</Text>
            <Text style={styles.hudLbl}>{lbl}</Text>
          </View>
        ))}
      </View>

      {/* onPressIn responde al tocar, sin esperar a levantar el dedo (RNF-01). */}
      <Pressable style={styles.field} onPressIn={jump} onLayout={onFieldLayout}>
        {state && (
          <>
            <View style={styles.ground}>
              {Array.from({ length: tickCount }, (_, i) => (
                <View key={i} style={[styles.groundTick, { left: i * GROUND_TICK_GAP - tickOffset }]} />
              ))}
            </View>

            {state.obstacles.map((obstacle) => (
              <ObstacleFigure key={obstacle.id} type={obstacle.type} left={obstacle.x} bottom={GROUND_HEIGHT} />
            ))}

            <RobotFigure
              left={state.robotX}
              bottom={GROUND_HEIGHT + state.robotY}
              crashed={crashed}
              airborne={state.phase === 'jumping'}
              stride={Math.floor(state.elapsedMs / 120) % 2 === 0}
            />

            {state.elapsedMs < HINT_VISIBLE_MS && !crashed && (
              <Text style={styles.hint}>TOCA PARA SALTAR</Text>
            )}
            {crashed && <Text style={styles.crash}>¡CHOQUE!</Text>}
          </>
        )}
      </Pressable>

      <Text style={styles.footer}>Esquiva los obstáculos · la velocidad aumenta cada nivel</Text>
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
  field: {
    flex: 1, backgroundColor: '#0D0D22',
    borderWidth: 1, borderColor: '#232340',
    borderRadius: 14, marginBottom: 12,
    overflow: 'hidden',
  },
  ground: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    height: GROUND_HEIGHT,
    borderTopWidth: 2, borderTopColor: '#A855F7',
    backgroundColor: '#11112A',
  },
  groundTick: { position: 'absolute', top: 8, width: 14, height: 2, backgroundColor: '#2A2A4A' },
  hint: {
    position: 'absolute', top: '30%', alignSelf: 'center',
    color: '#22D3EE', fontSize: 11, fontWeight: '900', letterSpacing: 3,
  },
  crash: {
    position: 'absolute', top: '30%', alignSelf: 'center',
    color: '#EC4899', fontSize: 22, fontWeight: '900', letterSpacing: 4,
  },
  footer: { color: '#3C3C5C', fontSize: 9, letterSpacing: 1, textAlign: 'center' },
});
