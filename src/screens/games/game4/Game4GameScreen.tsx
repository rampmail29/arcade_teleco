import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameHeader from '../../../components/game/GameHeader';
import AppButton from '../../../components/common/AppButton';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Game4Game'>;

export default function Game4GameScreen({ navigation }: Props): React.JSX.Element {
  const [score, setScore] = useState<number>(0);

  return (
    <View style={styles.container}>
      <GameHeader title="Game4" />
      <Text>Puntaje: {score}</Text>
      <AppButton title="Finalizar" onPress={() => navigation.navigate('Game4Result', { score })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
});
