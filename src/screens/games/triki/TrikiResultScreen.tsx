import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from './components/TrikiButton';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TrikiResult'>;

export default function TrikiResultScreen({ route, navigation }: Props): React.JSX.Element {
  const { score } = route.params; 

  let resultText = "¡Empate!";
  let penaltyText = "¡Todos a beber pola! 🍻";
  let resultColor = '#555';

  if (score === 1) {
    resultText = "¡Ganó la X!";
    penaltyText = "La O es el perdedor y debe beber pola 🍻";
    resultColor = '#007AFF'; // Azul
  } else if (score === 2) {
    resultText = "¡Ganó la O!";
    penaltyText = "La X es el perdedor y debe beber pola 🍻";
    resultColor = '#FF3B30'; // Rojo
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fin de la partida</Text>
      
      <Text style={[styles.result, { color: resultColor }]}>{resultText}</Text>
      
      {/* Mensaje de la penitencia */}
      <Text style={styles.penalty}>{penaltyText}</Text>
      
      <AppButton 
        title="La Revancha" 
        onPress={() => navigation.replace('TrikiGame')} 
      />
      <View style={styles.spacer} />
      <AppButton 
        title="Volver al Menú" 
        variant="secondary"
        onPress={() => navigation.navigate('Home')} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 15, color: '#666' },
  result: { fontSize: 45, marginBottom: 15, fontWeight: 'bold', textAlign: 'center' },
  penalty: { 
    fontSize: 22, 
    marginBottom: 50, 
    color: '#d35400', // Un tono naranja/ámbar como la cerveza
    fontWeight: 'bold', 
    textAlign: 'center', 
    paddingHorizontal: 15 
  },
  spacer: { height: 15 }
});