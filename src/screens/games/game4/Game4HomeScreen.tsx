import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameHeader from '../../../components/game/GameHeader';
import AppButton from '../../../components/common/AppButton';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Game4'>;

export default function Game4HomeScreen({ navigation }: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <GameHeader title="Game4" />
      <Text>Pantalla de inicio de Game4 (demostrativa).</Text>
      <AppButton title="Jugar" onPress={() => navigation.navigate('Game4Game')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
});
