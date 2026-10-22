import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface RacingHUDProps {
  score: number;
  lives: number;
}

export const RacingHUD: React.FC<RacingHUDProps> = ({ score, lives }) => {
  return (
    <View style={styles.headerRow}>
      <View style={styles.badge}>
        <Text style={styles.scoreText}>PTS: {score}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.livesText}>{'❤️'.repeat(Math.max(0, lives))}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    position: 'absolute',
    top: 65,
    left: 12,
    right: 12,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffd166',
  },
  scoreText: {
    color: '#ffd166',
    fontSize: 16,
    fontWeight: 'bold',
  },
  livesText: {
    fontSize: 16,
  },
});