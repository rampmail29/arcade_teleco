import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../../../components/common/AppButton';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TriviaResult'>;

export default function TriviaResultScreen({ navigation, route }: Props): React.JSX.Element {
  const { score = 0 } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultado — Trivia</Text>
      <Text>Puntaje final: {score}</Text>
      <AppButton title="Volver al Game Hub" onPress={() => navigation.navigate('Home')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: {},
});
