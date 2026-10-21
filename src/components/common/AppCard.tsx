import React from 'react';
import { View, StyleSheet } from 'react-native';

interface AppCardProps {
  children: React.ReactNode;
}

export default function AppCard({ children }: AppCardProps): React.JSX.Element {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
