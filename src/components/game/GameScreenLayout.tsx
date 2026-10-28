import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameHeader from './GameHeader';

interface Props {
  title: string;
  children: React.ReactNode;
  scrollable?: boolean;
  onBack?: () => void;
  status?: 'LIVE' | 'END';
}

export default function GameScreenLayout({ title, children, scrollable = false, onBack, status }: Props) {
  const Inner = scrollable ? ScrollView : View;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <GameHeader title={title} onBack={onBack} status={status} />
      <Inner style={styles.body} contentContainerStyle={scrollable ? styles.scroll : undefined}>
        {children}
      </Inner>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#07071A' },
  body: { flex: 1, padding: 16 },
  scroll: { paddingBottom: 32 },
});