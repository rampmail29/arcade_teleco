import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { racingService } from '../../../services/racingService';

const TRACK_WIDTH = 360;
const TRACK_HEIGHT = 650;
const LANE_WIDTH = TRACK_WIDTH / 3;
const CAR_WIDTH = 64;
const CAR_HEIGHT = 70;
const PLAYER_Y = TRACK_HEIGHT - 135;

interface Item {
  id: number;
  lane: number;
  y: number;
  speed: number;
  emoji: string;
  type: 'obstacle' | 'coin';
}

const OBSTACLE_TYPES = ['🚧', '🪨', '⚠️', '🛢️'];

export const RacingGameScreen = ({ navigation }: any) => {
  const [carLane, setCarLane] = useState<number>(1);
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [isInvulnerable, setIsInvulnerable] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [savingScore, setSavingScore] = useState<boolean>(false);

  const carLaneRef = useRef<number>(1);
  const scoreRef = useRef<number>(0);
  const livesRef = useRef<number>(3);
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
    }, 1500);
  };

  const startGame = useCallback(() => {
    stopAll();
    setGameOver(false);
    gameOverRef.current = false;
    setScore(0);
    scoreRef.current = 0;
    setLives(3);
    livesRef.current = 3;
    setIsInvulnerable(false);
    isInvulnerableRef.current = false;
    setItems([]);
    setCarLane(1);
    carLaneRef.current = 1;

    // Generador de obstáculos y monedas
    spawnerRef.current = setInterval(() => {
      if (gameOverRef.current) return;

      const randomLane = Math.floor(Math.random() * 3);
      const isCoin = Math.random() < 0.3; // 30% monedas

      const newItem: Item = {
        id: Date.now() + Math.random(),
        lane: randomLane,
        y: -60,
        speed: 5 + Math.min(Math.floor(scoreRef.current / 150), 7),
        emoji: isCoin ? '' : OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)],
        type: isCoin ? 'coin' : 'obstacle',
      };

      setItems((prev) => [...prev, newItem]);
    }, 1100);

    // Ciclo de físicas (60 FPS)
    gameLoopRef.current = setInterval(() => {
      if (gameOverRef.current) return;

      setItems((prev) => {
        let lifeLost = false;

        const filtered = prev
          .map((item) => ({ ...item, y: item.y + item.speed }))
          .filter((item) => {
            const sameLane = item.lane === carLaneRef.current;
            const touchingY = item.y + 40 >= PLAYER_Y && item.y <= PLAYER_Y + 50;

            // Recoger moneda
            if (item.type === 'coin' && sameLane && touchingY) {
              scoreRef.current += 25;
              setScore(scoreRef.current);
              return false;
            }

            // Chocar con obstáculo
            if (item.type === 'obstacle' && sameLane && touchingY) {
              if (!isInvulnerableRef.current) {
                lifeLost = true;
              }
              return false;
            }

            // Esquivado exitoso
            if (item.y >= TRACK_HEIGHT + 20) {
              if (item.type === 'obstacle') {
                scoreRef.current += 10;
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

  // Limpieza al cambiar de vista en el stack
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

  // Controles de teclado físico
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (gameOverRef.current) return;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          setCarLane((prev) => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          setCarLane((prev) => Math.min(2, prev + 1));
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
      console.log('Error enviando puntuación al backend:', err);
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
  const moveRight = () => setCarLane((prev) => Math.min(2, prev + 1));

  return (
    <View style={styles.outerContainer}>
      <View style={styles.track}>
        {/* Cielo / Horizonte superior de rampa */}
        <View style={styles.horizonSky}>
          <Text style={styles.horizonText}>RAMPA DE ASCENSO UTS</Text>
        </View>

        {/* Cabecera */}
        <View style={styles.headerRow}>
          <View style={styles.badge}>
            <Text style={styles.scoreText}>PTS: {score}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.livesText}>
              {'❤️'.repeat(Math.max(0, lives))}
            </Text>
          </View>
        </View>

        {/* Líneas divisorias de rampa */}
        <View style={[styles.laneLine, { left: LANE_WIDTH }]} />
        <View style={[styles.laneLine, { left: LANE_WIDTH * 2 }]} />

        {/* Vehículo visto desde atrás subiendo (Estilo 3D Ramp) */}
        <View
          style={[
            styles.carWrapper,
            {
              left: carLane * LANE_WIDTH + (LANE_WIDTH - CAR_WIDTH) / 2,
              top: PLAYER_Y,
              opacity: isInvulnerable ? 0.4 : 1,
            },
          ]}
        >
          {/* Alerón / Techo superior */}
          <View style={styles.carRoof} />
          {/* Vidrio trasero */}
          <View style={styles.rearWindow} />
          {/* Chasis principal trasero */}
          <View style={styles.carChassis}>
            {/* Luces traseras LED rojas */}
            <View style={styles.tailLightLeft} />
            <View style={styles.licensePlate}>
              <Text style={styles.plateText}>UTS</Text>
            </View>
            <View style={styles.tailLightRight} />
          </View>
          {/* Tubos de escape con fuego nitro */}
          <View style={styles.exhaustRow}>
            <View style={styles.exhaustFlame} />
            <View style={styles.exhaustPipe} />
            <View style={styles.exhaustPipe} />
            <View style={styles.exhaustFlame} />
          </View>
        </View>

        {/* Obstáculos y Monedas */}
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

        {/* Controles táctiles */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.btn} onPress={moveLeft}>
            <Text style={styles.btnText}>◀</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={moveRight}>
            <Text style={styles.btnText}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Modal Game Over */}
        {gameOver && (
          <Modal visible={gameOver} transparent animationType="fade">
            <View style={styles.modalBg}>
              <View style={styles.modalCard}>
                <Text style={styles.crashTitle}>💥 ¡RAMPA FALLIDA!</Text>
                <Text style={styles.finalScore}>Puntaje Final: {score}</Text>

                {savingScore ? (
                  <ActivityIndicator size="small" color="#00f5d4" style={{ marginVertical: 12 }} />
                ) : (
                  <Text style={styles.syncOk}>✓ Puntos guardados en Backend</Text>
                )}

                <TouchableOpacity style={styles.playAgainBtn} onPress={startGame}>
                  <Text style={styles.playAgainText}>REINTENTAR</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.hubBtn} onPress={handleExitToHub}>
                  <Text style={styles.hubText}>Volver al Hub</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
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
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    backgroundColor: '#d89758', // Tono arena / madera como la rampa acrobática
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
    backgroundColor: '#4ea8de', // Cielo en el tope
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
  scoreText: { color: '#ffd166', fontSize: 16, fontWeight: 'bold' },
  livesText: { fontSize: 16 },
  laneLine: {
    position: 'absolute',
    top: 60,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
  },
  // Auto en perspectiva trasera
  carWrapper: {
    position: 'absolute',
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
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
    width: CAR_WIDTH,
    height: 28,
    backgroundColor: '#2d6a4f', // Color verde deportivo
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
    backgroundColor: '#00f5d4', // Nitro azul/verde
    borderRadius: 2,
    shadowColor: '#00f5d4',
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  // Ítems y obstáculos
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
  // Controles
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
  btnText: { fontSize: 24, color: '#fff' },
  // Modal Game Over
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#1b1d26',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: 290,
    borderWidth: 1,
    borderColor: '#7a4e27',
  },
  crashTitle: { fontSize: 22, color: '#ff4d6d', fontWeight: 'bold', marginBottom: 8 },
  finalScore: { fontSize: 20, color: '#fff', fontWeight: 'bold', marginBottom: 8 },
  syncOk: { fontSize: 13, color: '#00f5d4', marginBottom: 16 },
  playAgainBtn: {
    backgroundColor: '#2d6a4f',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  playAgainText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  hubBtn: {
    backgroundColor: '#495057',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  hubText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});