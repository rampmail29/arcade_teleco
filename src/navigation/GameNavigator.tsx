import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import TriviaHomeScreen from '../screens/games/trivia/TriviaHomeScreen';
import TriviaGameScreen from '../screens/games/trivia/TriviaGameScreen';
import TriviaResultScreen from '../screens/games/trivia/TriviaResultScreen';
import MemoramaHomeScreen from '../screens/games/memorama/MemoramaHomeScreen';
import MemoramaGameScreen from '../screens/games/memorama/MemoramaGameScreen';
import MemoramaResultScreen from '../screens/games/memorama/MemoramaResultScreen';
import SudokuHomeScreen from '../screens/games/sudoku/SudokuHomeScreen';
import SudokuGameScreen from '../screens/games/sudoku/SudokuGameScreen';
import SudokuResultScreen from '../screens/games/sudoku/SudokuResultScreen';
import Game4HomeScreen from '../screens/games/game4/Game4HomeScreen';
import Game4GameScreen from '../screens/games/game4/Game4GameScreen';
import Game4ResultScreen from '../screens/games/game4/Game4ResultScreen';
import type { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function GameNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Trivia" component={TriviaHomeScreen} />
      <Stack.Screen name="TriviaGame" component={TriviaGameScreen} />
      <Stack.Screen name="TriviaResult" component={TriviaResultScreen} />
      <Stack.Screen name="Memorama" component={MemoramaHomeScreen} />
      <Stack.Screen name="MemoramaGame" component={MemoramaGameScreen} />
      <Stack.Screen name="MemoramaResult" component={MemoramaResultScreen} />
      <Stack.Screen name="Sudoku" component={SudokuHomeScreen} />
      <Stack.Screen name="SudokuGame" component={SudokuGameScreen} />
      <Stack.Screen name="SudokuResult" component={SudokuResultScreen} />
      <Stack.Screen name="Game4" component={Game4HomeScreen} />
      <Stack.Screen name="Game4Game" component={Game4GameScreen} />
      <Stack.Screen name="Game4Result" component={Game4ResultScreen} />
    </Stack.Navigator>
  );
}
