import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TrikiGame'>;
type Player = 'X' | 'O' | null;

export default function TrikiGameScreen({ navigation }: Props): React.JSX.Element {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);

  // Validador de victoria
  const checkWinner = (currentBoard: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontales
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Verticales
      [0, 4, 8], [2, 4, 6]             // Diagonales
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }
    return null;
  };

  const handlePress = (index: number) => {
    if (board[index] || checkWinner(board)) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  useEffect(() => {
    const winner = checkWinner(board);
    if (winner) {
      navigation.replace('TrikiResult', { score: winner === 'X' ? 1 : 2 });
    } else if (!board.includes(null)) {
      navigation.replace('TrikiResult', { score: 0 }); // Empate
    }
  }, [board]);

  return (
    <View style={styles.container}>
      <Text style={styles.turnText}>
        Turno de: <Text style={isXNext ? styles.xText : styles.oText}>{isXNext ? 'X' : 'O'}</Text>
      </Text>
      
      <View style={styles.board}>
        {board.map((cell, index) => (
          <TouchableOpacity
            key={index}
            style={styles.cell}
            onPress={() => handlePress(index)}
            activeOpacity={0.7}
          >
            <Text style={[styles.cellText, cell === 'X' ? styles.xText : styles.oText]}>
              {cell}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa' },
  turnText: { fontSize: 28, fontWeight: 'bold', marginBottom: 40, color: '#333' },
  board: { width: 320, height: 320, flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#ddd', borderRadius: 10, overflow: 'hidden' },
  cell: { width: '33.33%', height: '33.33%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  cellText: { fontSize: 70, fontWeight: 'bold' },
  xText: { color: '#007AFF' }, // Azul
  oText: { color: '#FF3B30' }  // Rojo
});