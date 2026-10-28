import React from 'react';
import { TextInput, StyleSheet, type TextInputProps } from 'react-native';

export default function AppInput(props: TextInputProps): React.JSX.Element {
  return <TextInput style={styles.input} placeholderTextColor="#9ca3af" {...props} />;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});
