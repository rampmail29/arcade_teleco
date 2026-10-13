/**
 * useRobotRun
 * Conecta el motor de Robot Run con React: corre el game loop con
 * requestAnimationFrame, expone el estado para dibujar y guarda el puntaje
 * mediante scoreService al terminar la partida.
 *
 * Flujo: RobotRunGameScreen → useRobotRun → scoreService → (mockData | apiClient)
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { GAME_ID } from '../screens/games/robotrun/logic/robotRunConfig';
import {
  createInitialState,
  dispatch,
  step,
  type RobotRunState,
} from '../screens/games/robotrun/logic/robotRunEngine';
import { getBestScore, saveScore } from '../services/scoreService';
import type { RobotRunResultParams } from '../types';

interface UseRobotRunOptions {
  onGameOver: (result: RobotRunResultParams) => void;
}

interface UseRobotRunResult {
  state: RobotRunState | null; // null hasta conocer el tamaño del área de juego
  bestScore: number;
  jump: () => void;
  quit: () => void;
  onFieldLayout: (event: LayoutChangeEvent) => void;
}

export function useRobotRun({ onGameOver }: UseRobotRunOptions): UseRobotRunResult {
  const [state, setState] = useState<RobotRunState | null>(null);
  const [bestScore, setBestScore] = useState(0);

  const stateRef = useRef<RobotRunState | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const commit = useCallback((next: RobotRunState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const stopLoop = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    lastTimeRef.current = null;
  }, []);

  const finishGame = useCallback(async (finished: RobotRunState) => {
    const { bestScore: best, isNewRecord } = await saveScore(GAME_ID, finished.score);
    if (!mountedRef.current) return;
    onGameOverRef.current({
      score: finished.score,
      obstaclesPassed: finished.obstaclesPassed,
      bestScore: best,
      isNewRecord,
    });
  }, []);

  const loop = useCallback(
    (time: number) => {
      const current = stateRef.current;
      if (!current) return;
      const frameMs = lastTimeRef.current === null ? 0 : time - lastTimeRef.current;
      lastTimeRef.current = time;

      const next = step(current, frameMs);
      if (next !== current) commit(next);

      if (next.phase === 'finished') {
        stopLoop();
        void finishGame(next);
        return;
      }
      frameRef.current = requestAnimationFrame(loop);
    },
    [commit, finishGame, stopLoop],
  );

  // Arranca la partida en cuanto se conoce el ancho del área de juego.
  const onFieldLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (stateRef.current) return;
      const { width } = event.nativeEvent.layout;
      commit(dispatch(createInitialState(width), 'START'));
      frameRef.current = requestAnimationFrame(loop);
    },
    [commit, loop],
  );

  const jump = useCallback(() => {
    const current = stateRef.current;
    if (!current) return;
    const next = dispatch(current, 'JUMP'); // se ignora si ya está saltando
    if (next !== current) commit(next);
  }, [commit]);

  // Abandonar la partida: detiene el loop y descarta el puntaje parcial.
  const quit = useCallback(() => {
    stopLoop();
    const current = stateRef.current;
    if (current) commit(dispatch(current, 'QUIT'));
  }, [commit, stopLoop]);

  useEffect(() => {
    mountedRef.current = true;
    getBestScore(GAME_ID).then((best) => {
      if (mountedRef.current) setBestScore(best);
    });
    return () => {
      mountedRef.current = false;
      stopLoop();
    };
  }, [stopLoop]);

  return { state, bestScore, jump, quit, onFieldLayout };
}
