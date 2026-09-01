import React from 'react';
import { View, StyleSheet } from 'react-native';

interface AppCardProps {
  children: React.ReactNode;
}

export default function AppCard({ children }: AppCardProps): React.JSX.Element {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {},
});
