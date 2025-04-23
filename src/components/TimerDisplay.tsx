import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { formatDuration } from '../utils/formatters';
import { TimerStatus } from '../hooks/useTimer'; // Импортируем тип статуса

interface TimerDisplayProps {
  seconds: number;
  status: TimerStatus;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds, status }) => {
  const formattedTime = formatDuration(seconds);
  const displayColor = React.useMemo(() => {
    switch (status) {
      case TimerStatus.Running: return '#66ff99'; // Ярко-зеленый
      case TimerStatus.Paused: return '#ffcc66'; // Оранжевый
      case TimerStatus.Finished: return '#ff6666'; // Красный
      case TimerStatus.Initial:
      default: return '#cccccc'; // Светло-серый
    }
  }, [status]);

  return (
    <View style={styles.container}>
      <Text style={[styles.timeText, { color: displayColor }]}>
        {formattedTime}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
    // Можно добавить фон или рамку
     padding: 10,
     // backgroundColor: 'rgba(255, 255, 255, 0.05)',
     // borderRadius: 10,
  },
  timeText: {
    fontSize: 72,
    fontWeight: 'bold',
    textAlign: 'center',
    fontVariant: ['tabular-nums'], // Моноширинные цифры
    // Тень для лучшей читаемости
     textShadowColor: 'rgba(0, 0, 0, 0.5)',
     textShadowOffset: { width: 1, height: 1 },
     textShadowRadius: 3,
  },
});

export default TimerDisplay;
