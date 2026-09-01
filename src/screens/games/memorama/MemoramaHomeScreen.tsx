import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameHeader from '../../../components/game/GameHeader';
import AppButton from '../../../components/common/AppButton';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Memorama'>;

export default function MemoramaHomeScreen({ navigation }: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <GameHeader title="Memorama" />
      <Text>Pantalla de inicio de Memorama (demostrativa).</Text>
      <AppButton title="Jugar" onPress={() => navigation.navigate('MemoramaGame')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
});
