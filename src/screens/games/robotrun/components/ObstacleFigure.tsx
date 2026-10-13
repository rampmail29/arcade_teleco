import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { ObstacleType } from '../logic/robotRunConfig';

interface ObstacleFigureProps {
  type: ObstacleType;
  left: number;
  bottom: number;
}

/** Obstáculo geométrico: bloque o rombo (un View rotado 45°). */
export default function ObstacleFigure({ type, left, bottom }: ObstacleFigureProps): React.JSX.Element {
  const box = { left, bottom, width: type.width, height: type.height };

  if (type.shape === 'diamond') {
    const side = Math.round(type.width / Math.SQRT2);
    return (
      <View style={[styles.frame, styles.center, box]}>
        <View
          style={[
            styles.diamond,
            { width: side, height: side, borderColor: type.color, backgroundColor: `${type.color}33` },
          ]}
        />
      </View>
    );
  }

  return <View style={[styles.frame, styles.block, box, { borderColor: type.color, backgroundColor: `${type.color}33` }]} />;
}

const styles = StyleSheet.create({
  frame: { position: 'absolute' },
  center: { alignItems: 'center', justifyContent: 'center' },
  block: { borderWidth: 2, borderRadius: 4 },
  diamond: { borderWidth: 2, borderRadius: 3, transform: [{ rotate: '45deg' }] },
});
