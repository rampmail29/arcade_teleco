import React from 'react';
import { TextInput, StyleSheet, type TextInputProps } from 'react-native';

export default function AppInput(props: TextInputProps): React.JSX.Element {
  return <TextInput style={styles.input} {...props} />;
}

const styles = StyleSheet.create({
  input: {},
});
