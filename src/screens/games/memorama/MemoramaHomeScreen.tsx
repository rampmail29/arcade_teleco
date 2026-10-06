import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import GameScreenLayout from '../../../components/game/GameScreenLayout';
import AppButton from '../../../components/common/AppButton';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Memorama'>;

export default function MemoramaHomeScreen({ navigation }: Props): React.JSX.Element {
  return (
    <GameScreenLayout title="Memorama" onBack={() => navigation.navigate('Home')}>
      <View style={styles.infoCard}>
        <Image
          source={require('../../../../assets/images/memorama.png')}
          style={styles.icon}
        />
        <Text style={styles.cardBadge}>GAME_02</Text>
        <Text style={styles.cardTitle}>MEMORAMA</Text>
        <Text style={styles.cardDesc}>
          Encuentra todos los pares de cartas antes de que se acabe el tiempo. ¡Pon a prueba tu memoria!
        </Text>
      </View>

      <View style={styles.statsRow}>
        {[['16', 'CARTAS'], ['60s', 'TIEMPO'], ['★★★', 'NIVEL']].map(([val, lbl]) => (
          <View key={lbl} style={styles.stat}>
            <Text style={styles.statVal}>{val}</Text>
            <Text style={styles.statLbl}>{lbl}</Text>
          </View>
        ))}
      </View>

      <AppButton title="▶  PLAY" onPress={() => navigation.navigate('MemoramaGame')} />
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: '#0D0D22',
    borderWidth: 1,
    borderColor: '#232340',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  cardBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: '#1A0D30', borderWidth: 1, borderColor: '#3C2060',
    borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
    color: '#A855F7', fontSize: 8, letterSpacing: 1,
  },
  cardTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 3, marginBottom: 8 },
  cardDesc: { color: '#5A5A72', fontSize: 11, textAlign: 'center', lineHeight: 18 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  stat: {
    flex: 1, backgroundColor: '#0D0D22',
    borderWidth: 1, borderColor: '#1E1E38',
    borderRadius: 10, padding: 10, alignItems: 'center',
  },
  statVal: { color: '#F59E0B', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  statLbl: { color: '#5E5E7A', fontSize: 8, letterSpacing: 1.5, marginTop: 3 },
});