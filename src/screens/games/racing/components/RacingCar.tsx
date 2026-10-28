import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { RACING_CONFIG, LANE_WIDTH, PLAYER_Y } from '../logic/racingConfig';

interface RacingCarProps {
  lane: number;
  isInvulnerable: boolean;
}

export const RacingCar: React.FC<RacingCarProps> = ({ lane, isInvulnerable }) => {
  return (
    <View
      style={[
        styles.carWrapper,
        {
          left: lane * LANE_WIDTH + (LANE_WIDTH - RACING_CONFIG.CAR_WIDTH) / 2,
          top: PLAYER_Y,
          opacity: isInvulnerable ? 0.4 : 1,
        },
      ]}
    >
      <View style={styles.carRoof} />
      <View style={styles.rearWindow} />
      <View style={styles.carChassis}>
        <View style={styles.tailLightLeft} />
        <View style={styles.licensePlate}>
          <Text style={styles.plateText}>UTS</Text>
        </View>
        <View style={styles.tailLightRight} />
      </View>
      <View style={styles.exhaustRow}>
        <View style={styles.exhaustFlame} />
        <View style={styles.exhaustPipe} />
        <View style={styles.exhaustPipe} />
        <View style={styles.exhaustFlame} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  carWrapper: {
    position: 'absolute',
    width: RACING_CONFIG.CAR_WIDTH,
    height: RACING_CONFIG.CAR_HEIGHT,
    alignItems: 'center',
    zIndex: 5,
  },
  carRoof: {
    width: 44,
    height: 12,
    backgroundColor: '#1b4332',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomWidth: 2,
    borderColor: '#081c15',
  },
  rearWindow: {
    width: 48,
    height: 18,
    backgroundColor: '#14213d',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: '#000',
  },
  carChassis: {
    width: RACING_CONFIG.CAR_WIDTH,
    height: 28,
    backgroundColor: '#2d6a4f',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#081c15',
  },
  tailLightLeft: {
    width: 12,
    height: 8,
    backgroundColor: '#ff0054',
    borderRadius: 2,
    shadowColor: '#ff0054',
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  tailLightRight: {
    width: 12,
    height: 8,
    backgroundColor: '#ff0054',
    borderRadius: 2,
    shadowColor: '#ff0054',
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  licensePlate: {
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  plateText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000',
  },
  exhaustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 36,
    justifyContent: 'space-between',
    marginTop: 1,
  },
  exhaustPipe: {
    width: 6,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  exhaustFlame: {
    width: 4,
    height: 8,
    backgroundColor: '#00f5d4',
    borderRadius: 2,
    shadowColor: '#00f5d4',
    shadowOpacity: 1,
    shadowRadius: 5,
  },
});