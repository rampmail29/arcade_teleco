import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ROBOT } from '../logic/robotRunConfig';

interface RobotFigureProps {
  left: number;
  bottom: number;
  crashed: boolean;
  airborne: boolean;
  stride: boolean; // alterna las piernas para simular la carrera
}

/** Robot dibujado solo con View + StyleSheet (sin sprites). */
export default function RobotFigure({ left, bottom, crashed, airborne, stride }: RobotFigureProps): React.JSX.Element {
  const color = crashed ? '#EC4899' : '#A855F7';
  const eyeColor = crashed ? '#F59E0B' : '#22D3EE';
  const legUp = airborne ? [4, 4] : stride ? [7, 3] : [3, 7];

  return (
    <View style={[styles.robot, { left, bottom }]}>
      <View style={[styles.antennaDot, { backgroundColor: eyeColor }]} />
      <View style={[styles.antenna, { backgroundColor: color }]} />
      <View style={[styles.head, { borderColor: color }]}>
        <View style={[styles.eye, { backgroundColor: eyeColor }]} />
        <View style={[styles.eye, { backgroundColor: eyeColor }]} />
      </View>
      <View style={[styles.body, { backgroundColor: color }]} />
      <View style={styles.legs}>
        <View style={[styles.leg, { height: legUp[0], backgroundColor: color }]} />
        <View style={[styles.leg, { height: legUp[1], backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  robot: {
    position: 'absolute',
    width: ROBOT.width,
    height: ROBOT.height,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  antennaDot: { width: 5, height: 5, borderRadius: 3 },
  antenna: { width: 2, height: 2 },
  head: {
    width: ROBOT.width,
    height: 17,
    borderWidth: 2,
    borderRadius: 6,
    backgroundColor: '#0D0D22',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  eye: { width: 6, height: 6, borderRadius: 3 },
  body: { width: 24, height: 10, borderRadius: 3, marginTop: 1 },
  legs: { width: 18, height: 7, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  leg: { width: 5, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
});
