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
  card: {
    backgroundColor: '#007AFF', // Un azul bonito para los botones
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Sombra para Android
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});