import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface ErrorMessageProps {
  message: string | null;
}

export default function ErrorMessage({ message }: ErrorMessageProps): React.JSX.Element | null {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  error: { color: 'red' },
});
