import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameHeader from '../../../components/game/GameHeader';
import AppButton from '../../../components/common/AppButton';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Trivia'>;

export default function TriviaHomeScreen({ navigation }: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <GameHeader title="Trivia" />
      <Text>Pantalla de inicio de Trivia (demostrativa).</Text>
      <AppButton title="Jugar" onPress={() => navigation.navigate('TriviaGame')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
});
