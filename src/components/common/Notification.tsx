import React from 'react';
import { Text, StyleSheet } from 'react-native';

export type NotificationType = 'success' | 'error';

interface NotificationProps {
  type: NotificationType;
  message: string | null;
}

export default function Notification({ type, message }: NotificationProps): React.JSX.Element | null {
  if (!message) return null;
  return <Text style={[styles.base, type === 'success' ? styles.success : styles.error]}>{message}</Text>;
}

const styles = StyleSheet.create({
  base: {
    textAlign: 'center',
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
  },
  success: { backgroundColor: '#e6f4ea', color: '#1e7e34' },
  error: { backgroundColor: '#fdecea', color: '#c0392b' },
});
