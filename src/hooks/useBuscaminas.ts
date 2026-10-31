/**
 * useBuscaminas
 * Conecta el motor de Buscaminas con React y guarda el puntaje al terminar
 * la partida (ganada o perdida) con scoreService.
 *
 * Flujo: BuscaminasGameScreen → useBuscaminas → scoreService → (mockData | apiClient)
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { GAME_ID } from '../screens/games/buscaminas/logic/buscaminasConfig';
import { createInitialState, reveal, type BuscaminasState } from '../screens/games/buscaminas/logic/buscaminasEngine';
import { getBestScore, saveScore } from '../services/scoreService';
import type { BuscaminasResultParams } from '../types';

interface UseBuscaminasOptions {
  onGameOver: (result: BuscaminasResultParams) => void;
}

interface UseBuscaminasResult {
  state: BuscaminasState;
  bestScore: number;
  revealCell: (row: number, col: number) => void;
  restart: () => void;
}

export function useBuscaminas({ onGameOver }: UseBuscaminasOptions): UseBuscaminasResult {
  const [state, setState] = useState<BuscaminasState>(() => createInitialState());
  const [bestScore, setBestScore] = useState(0);
  const mountedRef = useRef(true);
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  useEffect(() => {
    mountedRef.current = true;
    getBestScore(GAME_ID).then((best) => {
      if (mountedRef.current) setBestScore(best);
    });
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const finishGame = useCallback(async (finished: BuscaminasState) => {
    const { bestScore: best, isNewRecord } = await saveScore(GAME_ID, finished.score);
    if (!mountedRef.current) return;
    onGameOverRef.current({
      score: finished.score,
      cellsRevealed: finished.revealedSafeCount,
      won: finished.phase === 'won',
      bestScore: best,
      isNewRecord,
    });
  }, []);

  const revealCell = useCallback(
    (row: number, col: number) => {
      setState((current) => {
        const next = reveal(current, row, col);
        if (next !== current && next.phase !== 'playing') {
          void finishGame(next);
        }
        return next;
      });
    },
    [finishGame],
  );

  const restart = useCallback(() => {
    setState(createInitialState());
  }, []);

  return { state, bestScore, revealCell, restart };
}
