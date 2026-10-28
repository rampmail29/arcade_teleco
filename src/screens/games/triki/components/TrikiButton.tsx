import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';

interface TrikiButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export default function TrikiButton({ title, onPress, variant = 'primary' }: TrikiButtonProps): React.JSX.Element {
  return (
    <Pressable 
      style={[styles.button, variant === 'secondary' ? styles.secondary : styles.primary]} 
      onPress={onPress}
    >
      <Text style={[styles.text, variant === 'secondary' ? styles.textSecondary : styles.textPrimary]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center', width: '100%' },
  primary: { backgroundColor: '#007AFF' },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#999' },
  text: { fontSize: 16, fontWeight: 'bold' },
  textPrimary: { color: '#fff' },
  textSecondary: { color: '#666' }
});