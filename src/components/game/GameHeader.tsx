import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';

interface GameHeaderProps {
  title: string;
  onBack?: () => void;
  status?: 'READY' | 'LIVE' | 'END';
}

export default function GameHeader({ title, onBack, status = 'READY' }: GameHeaderProps): React.JSX.Element {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  const dotColor = status === 'LIVE' ? '#22D3EE' : status === 'END' ? '#F59E0B' : '#22D3EE';
  const txtColor = status === 'END' ? '#F59E0B' : '#22D3EE';

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        {onBack ? (
          <Pressable style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backTxt}>← HUB</Text>
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <Animated.View style={[styles.badge, { opacity }]}>
          <View style={[styles.badgeDot, { backgroundColor: dotColor }]} />
          <Text style={[styles.badgeText, { color: txtColor }]}>{status}</Text>
        </Animated.View>
      </View>

      <Text style={styles.kicker}>▸ ARCADE UTS ◂</Text>

      <View style={styles.mainRow}>
        <View style={styles.line} />
        <Text style={styles.title}>{title.toUpperCase()}</Text>
        <View style={styles.line} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, backgroundColor: '#07071A', borderBottomWidth: 1, borderBottomColor: '#1A1A30' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  backBtn: { backgroundColor: '#1A0D30', borderWidth: 1, borderColor: '#3C2060', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  backTxt: { color: '#A855F7', fontSize: 9, letterSpacing: 1 },
  backPlaceholder: { width: 48 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeDot: { width: 5, height: 5, borderRadius: 3 },
  badgeText: { fontSize: 8, letterSpacing: 2 },
  kicker: { color: '#A855F7', fontSize: 8, letterSpacing: 3, textAlign: 'center', marginBottom: 4 },
  mainRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  line: { flex: 1, height: 1, backgroundColor: '#2A2A4A' },
  title: { color: '#FFF', fontSize: 20, fontWeight: '900', letterSpacing: 3 },
});