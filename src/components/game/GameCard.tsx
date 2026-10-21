import React from 'react';

import {
  Pressable,
  Text,
  View,
  StyleSheet,
  Image,
  type GestureResponderEvent,
} from 'react-native';

interface GameCardProps {
  title: string;
  description: string;
  icon: string;
  index: number;
  onPress: (event: GestureResponderEvent) => void;
}

const gameIcons = {
  trivia: require('../../../assets/images/trivia.png'),
  memorama: require('../../../assets/images/memorama.png'),
  sudoku: require('../../../assets/images/sudoku.png'),
  game4: require('../../../assets/images/incognito.png'),
};

export default function GameCard({
  title,
  description,
  icon,
  index,
  onPress,
}: GameCardProps): React.JSX.Element {
  const number = String(index + 1).padStart(2, '0');

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <Text style={styles.number}>GAME_{number}</Text>

        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>READY</Text>
        </View>
      </View>

      <View style={styles.iconContainer}>
        <View style={styles.iconOuter}>
          <Image
            source={gameIcons[icon as keyof typeof gameIcons]}
            style={styles.iconImage}
          />
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>{title.toUpperCase()}</Text>

        <Text style={styles.description}>
          {description}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLine} />

        <Text style={styles.play}>
          PLAY
        </Text>

        <Text style={styles.arrow}>
          →
        </Text>
      </View>

      <View style={styles.cornerTop} />
      <View style={styles.cornerBottom} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    minHeight: 220,
    marginBottom: 14,

    padding: 14,

    backgroundColor: '#0D0D1E',

    borderWidth: 1,
    borderColor: '#232340',

    borderRadius: 14,

    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 12,

    elevation: 8,
  },

  cardPressed: {
    transform: [{ scale: 0.97 }],
    backgroundColor: '#13132A',
    borderColor: '#A855F7',
    shadowColor: '#A855F7',
    shadowOpacity: 0.4,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  number: {
    color: '#5E5E78',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#22D3EE',
    marginRight: 4,
  },

  liveText: {
    color: '#22D3EE',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },

  iconContainer: {
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    position: 'relative',
  },

  iconOuter: {
    width: 68,
    height: 68,

    borderRadius: 20,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#17172A',

    borderWidth: 1,
    borderColor: '#3C3C5D',

    transform: [
      { rotate: '45deg' },
    ],
  },

  iconImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    transform: [{ rotate: '-45deg' }],
  },

  info: {
    marginTop: 3,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1,
  },

  description: {
    color: '#77778F',
    fontSize: 10,
    marginTop: 3,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 12,
  },

  footerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#292942',
    marginRight: 8,
  },

  play: {
    color: '#A855F7',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  arrow: {
    color: '#22D3EE',
    fontSize: 16,
    marginLeft: 5,
  },

  cornerTop: {
    position: 'absolute',
    width: 30,
    height: 30,

    top: -15,
    right: -15,

    borderRadius: 15,

    borderWidth: 1,
    borderColor: '#A855F7',

    opacity: 0.35,
  },

  cornerBottom: {
    position: 'absolute',
    width: 20,
    height: 20,

    bottom: -10,
    left: -10,

    borderRadius: 10,

    borderWidth: 1,
    borderColor: '#22D3EE',

    opacity: 0.3,
  },
});
