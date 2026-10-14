import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AppButton from '../../../components/common/AppButton';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Triki'>;

export default function TrikiHomeScreen({ navigation }: Props): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TRIKI</Text>
      <Text style={styles.description}>
        Demuestra que eres el mejor estratega. ¡Consigue 3 en línea para ganar!
      </Text>
      
      <AppButton 
        title="Empezar Partida" 
        onPress={() => navigation.navigate('TrikiGame')} 
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
  title: { fontSize: 40, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  description: { fontSize: 16, marginBottom: 40, textAlign: 'center', color: '#666' },
  spacer: { height: 15 }
});