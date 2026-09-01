import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GameHeaderProps {
  title: string;
}

export default function GameHeader({ title }: GameHeaderProps): React.JSX.Element {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {},
  title: {},
});
