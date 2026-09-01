import React from 'react';
import { Pressable, Text, StyleSheet, type GestureResponderEvent } from 'react-native';

interface GameCardProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
}

export default function GameCard({ title, onPress }: GameCardProps): React.JSX.Element {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {},
  title: {},
});
