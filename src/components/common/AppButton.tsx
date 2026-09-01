import React from 'react';
import { Pressable, Text, StyleSheet, type GestureResponderEvent } from 'react-native';

interface AppButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

export default function AppButton({ title, onPress, disabled = false }: AppButtonProps): React.JSX.Element {
  return (
    <Pressable style={styles.button} onPress={onPress} disabled={disabled}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {},
  text: {},
});
