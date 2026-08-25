/**
 * HomeScreen (Game Hub)
 * Responsabilidad (sección 16): pantalla principal tras autenticarse.
 * Debe presentar: nombre de ARCADE UTS, usuario autenticado, GameGrid
 * (consumiendo src/data/games.js) y cierre de sesión.
 *
 * NO renombrar como "LandingPage". El nombre conceptual es "Game Hub".
 */
import { View, Text, StyleSheet } from 'react-native';
import GameGrid from '../../components/game/GameGrid';
import AppButton from '../../components/common/AppButton';
import { useAuth } from '../../hooks/useAuth';
import { games } from '../../data/games';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ARCADE UTS</Text>
      <Text style={styles.greeting}>Hola, {user?.email}</Text>
      <GameGrid games={games} onSelectGame={(game) => navigation.navigate(game.route)} />
      <AppButton title="Cerrar sesión" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: {},
  greeting: {},
});
