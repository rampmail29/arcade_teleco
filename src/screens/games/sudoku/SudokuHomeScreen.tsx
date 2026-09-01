import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameHeader from '../../../components/game/GameHeader';
import AppButton from '../../../components/common/AppButton';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Sudoku'>;

export default function SudokuHomeScreen({ navigation }: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <GameHeader title="Sudoku" />
      <Text>Pantalla de inicio de Sudoku (demostrativa).</Text>
      <AppButton title="Jugar" onPress={() => navigation.navigate('SudokuGame')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
});
