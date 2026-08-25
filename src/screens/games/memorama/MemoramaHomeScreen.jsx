/**
 * MemoramaHomeScreen
 * Responsabilidad: pantalla inicial del juego "Memorama" (reglas, nivel, botón
 * de inicio). Cada juego expone exactamente 3 screens: Home, Game y Result
 * (sección 27, criterio de aceptación "Juegos").
 *
 * Los juegos consumen mockData en el Corte 1 (sección 15/23); en el Corte 2
 * pasarán a consumir gameService -> apiClient -> API REST.
 */
import { View, Text, StyleSheet } from 'react-native';
import GameHeader from '../../../components/game/GameHeader';
import AppButton from '../../../components/common/AppButton';

export default function MemoramaHomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <GameHeader title="Memorama" />
      <Text>Pantalla de inicio de Memorama (demostrativa).</Text>
      <AppButton title="Jugar" onPress={() => navigation.navigate('MemoramaGame')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
});
