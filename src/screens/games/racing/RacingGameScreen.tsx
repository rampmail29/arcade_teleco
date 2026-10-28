import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { racingService } from '../../../services/racingService';
import { RACING_CONFIG, LANE_WIDTH, PLAYER_Y } from './logic/racingConfig';
import { RacingHUD } from './components/RacingHUD';
import { RacingCar } from './components/RacingCar';
import { RacingGameOverModal } from './components/RacingGameOverModal';

interface Item {
  id: number;
  lane: number;
  y: number;
  speed: number;
  emoji: string;
  type: 'obstacle' | 'coin';
}

export const RacingGameScreen = ({ navigation }: any) => {
  const [carLane, setCarLane] = useState<number>(1);
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(RACING_CONFIG.MAX_LIVES);
  const [isInvulnerable, setIsInvulnerable] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [savingScore, setSavingScore] = useState<boolean>(false);

  const carLaneRef = useRef<number>(1);
  const scoreRef = useRef<number>(0);
  const livesRef = useRef<number>(RACING_CONFIG.MAX_LIVES);
  const isInvulnerableRef = useRef<boolean>(false);
  const gameOverRef = useRef<boolean>(false);

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    carLaneRef.current = carLane;
  }, [carLane]);

  const stopAll = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (spawnerRef.current) {
      clearInterval(spawnerRef.current);
      spawnerRef.current = null;
    }
  }, []);

  const triggerInvulnerability = () => {
    isInvulnerableRef.current = true;
    setIsInvulnerable(true);
    setTimeout(() => {
      isInvulnerableRef.current = false;
      setIsInvulnerable(false);
    }, RACING_CONFIG.INVULNERABILITY_TIME_MS);
  };

  const startGame = useCallback(() => {
    stopAll();
    setGameOver(false);
    gameOverRef.current = false;
    setScore(0);
    scoreRef.current = 0;
    setLives(RACING_CONFIG.MAX_LIVES);
    livesRef.current = RACING_CONFIG.MAX_LIVES;
    setIsInvulnerable(false);
    isInvulnerableRef.current = false;
    setItems([]);
    setCarLane(1);
    carLaneRef.current = 1;

    spawnerRef.current = setInterval(() => {
      if (gameOverRef.current) return;

      const randomLane = Math.floor(Math.random() * RACING_CONFIG.LANE_COUNT);
      const isCoin = Math.random() < 0.3;

      const newItem: Item = {
        id: Date.now() + Math.random(),
        lane: randomLane,
        y: -60,
        speed: RACING_CONFIG.BASE_SPEED + Math.min(Math.floor(scoreRef.current / 150), 7),
        emoji: isCoin ? '' : RACING_CONFIG.OBSTACLE_EMOJIS[Math.floor(Math.random() * RACING_CONFIG.OBSTACLE_EMOJIS.length)],
        type: isCoin ? 'coin' : 'obstacle',
      };

      setItems((prev) => [...prev, newItem]);
    }, RACING_CONFIG.SPAWN_INTERVAL);

    gameLoopRef.current = setInterval(() => {
      if (gameOverRef.current) return;

      setItems((prev) => {
        let lifeLost = false;

        const filtered = prev
          .map((item) => ({ ...item, y: item.y + item.speed }))
          .filter((item) => {
            const sameLane = item.lane === carLaneRef.current;
            const touchingY = item.y + 40 >= PLAYER_Y && item.y <= PLAYER_Y + 50;

            if (item.type === 'coin' && sameLane && touchingY) {
              scoreRef.current += RACING_CONFIG.POINTS_PER_COIN;
              setScore(scoreRef.current);
              return false;
            }

            if (item.type === 'obstacle' && sameLane && touchingY) {
              if (!isInvulnerableRef.current) {
                lifeLost = true;
              }
              return false;
            }

            if (item.y >= RACING_CONFIG.TRACK_HEIGHT + 20) {
              if (item.type === 'obstacle') {
                scoreRef.current += RACING_CONFIG.POINTS_PER_OBSTACLE;
                setScore(scoreRef.current);
              }
              return false;
            }

            return true;
          });

        if (lifeLost) {
          livesRef.current -= 1;
          setLives(livesRef.current);

          if (livesRef.current <= 0) {
            triggerGameOver();
          } else {
            triggerInvulnerability();
          }
        }

        return filtered;
      });
    }, 1000 / 60);
  }, [stopAll]);

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => startGame());
    const unsubscribeBlur = navigation.addListener('blur', () => {
      stopAll();
      setGameOver(false);
      gameOverRef.current = true;
    });

    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
      stopAll();
    };
  }, [navigation, startGame, stopAll]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (gameOverRef.current) return;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          setCarLane((prev) => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          setCarLane((prev) => Math.min(RACING_CONFIG.LANE_COUNT - 1, prev + 1));
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  const triggerGameOver = async () => {
    gameOverRef.current = true;
    stopAll();
    setGameOver(true);
    setSavingScore(true);

    try {
      await racingService.guardarScore('Piloto UTS', scoreRef.current, Math.floor(scoreRef.current / 10));
    } catch (err) {
      console.log('Error enviando puntuación:', err);
    } finally {
      setSavingScore(false);
    }
  };

  const handleExitToHub = () => {
    stopAll();
    setGameOver(false);
    gameOverRef.current = true;
    navigation.navigate('Home');
  };

  const moveLeft = () => setCarLane((prev) => Math.max(0, prev - 1));
  const moveRight = () => setCarLane((prev) => Math.min(RACING_CONFIG.LANE_COUNT - 1, prev + 1));

  return (
    <View style={styles.outerContainer}>
      <View style={styles.track}>
        <View style={styles.horizonSky}>
          <Text style={styles.horizonText}>RAMPA DE ASCENSO UTS</Text>
        </View>

        {/* Panel de puntos y vidas modular */}
        <RacingHUD score={score} lives={lives} />

        {/* Líneas de carril */}
        <View style={[styles.laneLine, { left: LANE_WIDTH }]} />
        <View style={[styles.laneLine, { left: LANE_WIDTH * 2 }]} />

        {/* Componente del carro modular */}
        <RacingCar lane={carLane} isInvulnerable={isInvulnerable} />

        {/* Obstáculos y monedas */}
        {items.map((item) => (
          <View
            key={item.id}
            style={[
              styles.itemWrapper,
              {
                left: item.lane * LANE_WIDTH + (LANE_WIDTH - 50) / 2,
                top: item.y,
              },
            ]}
          >
            {item.type === 'coin' ? (
              <View style={styles.coinCircle}>
                <View style={styles.coinInner}>
                  <Text style={styles.coinText}>$</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.obsEmoji}>{item.emoji}</Text>
            )}
          </View>
        ))}

        {/* Botones de control táctil */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.btn} onPress={moveLeft}>
            <Text style={styles.btnText}>◀</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={moveRight}>
            <Text style={styles.btnText}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Modal de fin de partida modular */}
        <RacingGameOverModal
          visible={gameOver}
          score={score}
          savingScore={savingScore}
          onRestart={startGame}
          onExit={handleExitToHub}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0a0b10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: RACING_CONFIG.TRACK_WIDTH,
    height: RACING_CONFIG.TRACK_HEIGHT,
    backgroundColor: '#d89758',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 4,
    borderColor: '#7a4e27',
  },
  horizonSky: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 60,
    backgroundColor: '#4ea8de',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#2b75a0',
  },
  horizonText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
    opacity: 0.8,
  },
  laneLine: {
    position: 'absolute',
    top: 60,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
  },
  itemWrapper: {
    position: 'absolute',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 4,
  },
  obsEmoji: {
    fontSize: 38,
  },
  coinCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fca311',
    borderWidth: 2,
    borderColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffb703',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinText: {
    color: '#7f4f00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controls: {
    position: 'absolute',
    bottom: 18,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    zIndex: 10,
  },
  btn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  btnText: {
    fontSize: 24,
    color: '#fff',
  },
});