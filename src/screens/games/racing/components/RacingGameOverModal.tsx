import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';

interface RacingGameOverModalProps {
  visible: boolean;
  score: number;
  savingScore: boolean;
  onRestart: () => void;
  onExit: () => void;
}

export const RacingGameOverModal: React.FC<RacingGameOverModalProps> = ({
  visible,
  score,
  savingScore,
  onRestart,
  onExit,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBg}>
        <View style={styles.modalCard}>
          <Text style={styles.crashTitle}>💥 ¡RAMPA FALLIDA!</Text>
          <Text style={styles.finalScore}>Puntaje Final: {score}</Text>

          {savingScore ? (
            <ActivityIndicator size="small" color="#00f5d4" style={{ marginVertical: 12 }} />
          ) : (
            <Text style={styles.syncOk}>✓ Puntos sincronizados</Text>
          )}

          <TouchableOpacity style={styles.playAgainBtn} onPress={onRestart}>
            <Text style={styles.playAgainText}>REINTENTAR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.hubBtn} onPress={onExit}>
            <Text style={styles.hubText}>Volver al Hub</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  crashTitle: {
    fontSize: 22,
    color: '#ff4d6d',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  finalScore: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  syncOk: {
    fontSize: 13,
    color: '#00f5d4',
    marginBottom: 16,
  },
  playAgainBtn: {
    backgroundColor: '#2d6a4f',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  playAgainText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  hubBtn: {
    backgroundColor: '#495057',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  hubText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});