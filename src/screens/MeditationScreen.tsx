import React, { useState, useEffect, useCallback } from 'react'; // Импортируем useCallback
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  Switch,
  Alert,
  // Platform, // Не используется
} from 'react-native';
import TimerDisplay from '../components/TimerDisplay';
import AudioSelector from '../components/AudioSelector';
import ControlButton from '../components/ControlButton';
import { useTimer, TimerStatus } from '../hooks/useTimer';
import { playOneShot, playBackground, stopBackground, pauseBackground } from '../services/audioService';
import { requestAudioPermission, pickAudioFile } from '../services/permissionService';
import { loadSettings, saveSettings, Settings } from '../services/storageService';

const MeditationScreen: React.FC = () => {
  const [startSoundUri, setStartSoundUri] = useState<string | null>(null);
  const [backgroundSoundUri, setBackgroundSoundUri] = useState<string | null>(null);
  const [endSoundUri, setEndSoundUri] = useState<string | null>(null);
  const [isBgSoundEnabled, setIsBgSoundEnabled] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const {
    status,
    remainingSeconds,
    totalSeconds,
    setTotalDuration, // Получаем функцию setTotalDuration из хука
    startTimer: hookStartTimer,
    pauseTimer: hookPauseTimer,
    stopTimer: hookStopTimer,
  } = useTimer(10 * 60);

  const [durationInput, setDurationInput] = useState<string>('10');

  // Оборачиваем setTotalDuration из хука в useCallback, чтобы передать в useEffect
  const memoizedSetTotalDuration = useCallback(setTotalDuration, [setTotalDuration]);

  useEffect(() => {
    const loadInitialSettings = async () => {
      try {
        const settings = await loadSettings();
        console.log('Loaded settings:', settings);
        if (settings.totalDurationSeconds) {
           // Используем memoizedSetTotalDuration внутри useEffect
          memoizedSetTotalDuration(settings.totalDurationSeconds);
          setDurationInput(Math.floor(settings.totalDurationSeconds / 60).toString());
        }
        setStartSoundUri(settings.startSoundUri ?? null);
        setBackgroundSoundUri(settings.backgroundSoundUri ?? null);
        setEndSoundUri(settings.endSoundUri ?? null);
        setIsBgSoundEnabled(settings.isBgSoundEnabled ?? false);
      } catch (error) {
        console.error('Failed to load settings:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить сохраненные настройки.');
      } finally {
          setIsInitialized(true);
      }
    };
    loadInitialSettings();
  }, [memoizedSetTotalDuration]); // Добавляем memoizedSetTotalDuration в зависимости

  useEffect(() => {
       if (!isInitialized) {return;}
       const settingsToSave: Settings = {
           totalDurationSeconds: totalSeconds,
           startSoundUri,
           backgroundSoundUri,
           endSoundUri,
           isBgSoundEnabled,
       };
       console.log('Saving settings:', settingsToSave);
       saveSettings(settingsToSave).catch(error => {
            console.error('Failed to save settings:', error);
       });
   }, [totalSeconds, startSoundUri, backgroundSoundUri, endSoundUri, isBgSoundEnabled, isInitialized]);


  const handleStart = () => {
    const wasPaused = status === TimerStatus.Paused;
    hookStartTimer();
    if (!wasPaused && startSoundUri) {
      playOneShot(startSoundUri);
    }
    if (backgroundSoundUri && isBgSoundEnabled) {
      playBackground(backgroundSoundUri, true);
    }
  };

  const handlePause = () => {
    hookPauseTimer();
    pauseBackground();
  };

  const handleStop = () => {
    hookStopTimer();
    stopBackground();
  };

  const handleSetDuration = () => {
    const minutes = parseInt(durationInput, 10);
    if (!isNaN(minutes) && minutes > 0) {
      setTotalDuration(minutes * 60); // Используем setTotalDuration из хука напрямую здесь
      // Скрываем клавиатуру (опционально)
       // import { Keyboard } from 'react-native';
       // Keyboard.dismiss();
    } else {
      Alert.alert('Ошибка', 'Введите корректное число минут (больше 0).');
    }
  };

  const handleSelectFile = async (
    setter: React.Dispatch<React.SetStateAction<string | null>>,
  ) => {
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
      Alert.alert(
        'Нет разрешения',
        'Пожалуйста, предоставьте разрешение на доступ к аудиофайлам в настройках приложения.',
      );
      return;
    }
    try {
      const fileUri = await pickAudioFile();
      if (fileUri) {
        setter(fileUri);
      }
    } catch (error: any) {
       console.error('File picker error:', error);
        if (error.code !== 'DOCUMENT_PICKER_CANCELED') { // Не показываем alert при отмене
            Alert.alert('Ошибка выбора файла', 'Не удалось выбрать файл.');
       }
    }
  };

  useEffect(() => {
    if (status === TimerStatus.Finished) {
      console.log('Timer finished, playing end sound...');
      stopBackground();
      if (endSoundUri) {
        playOneShot(endSoundUri);
      }
    }
  }, [status, endSoundUri]); // endSoundUri добавлен в зависимости


  const canEditSettings = status === TimerStatus.Initial || status === TimerStatus.Finished;
  const canStart = status === TimerStatus.Initial || status === TimerStatus.Paused;
  const canPause = status === TimerStatus.Running;
  const canStop = status !== TimerStatus.Initial;

  if (!isInitialized) {
      return <View style={styles.container}><Text style={styles.loadingText}>Загрузка настроек...</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Медитация</Text>

      <TimerDisplay seconds={remainingSeconds} status={status} />

      {canEditSettings && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={durationInput}
            onChangeText={setDurationInput}
            keyboardType="numeric"
            placeholder="Минуты"
            placeholderTextColor="#888"
            maxLength={3}
            onSubmitEditing={handleSetDuration} // Сохраняем по Enter
          />
          <ControlButton
            title="Уст."
            onPress={handleSetDuration}
            style={styles.setInputButton}
            textStyle={styles.setInputButtonText}
          />
        </View>
      )}
       {!canEditSettings && <View style={styles.inputContainerPlaceholder} />}


      <View style={styles.controlsContainer}>
        <ControlButton
          title={status === TimerStatus.Paused ? 'Продолжить' : 'Старт'}
          onPress={handleStart}
          disabled={!canStart}
          // iconName="play" // Раскомментируйте, если используете иконки
        />
        <ControlButton
          title="Пауза"
          onPress={handlePause}
          disabled={!canPause}
          // iconName="pause"
        />
        <ControlButton
          title="Стоп"
          onPress={handleStop}
          disabled={!canStop}
          // iconName="stop"
          color="#E57373"
        />
      </View>

      <View style={styles.audioSettingsContainer}>
        <Text style={styles.sectionTitle}>Настройки звука</Text>
        <AudioSelector
          label="Звук начала:"
          filePath={startSoundUri}
          onSelectFile={() => handleSelectFile(setStartSoundUri)}
          enabled={canEditSettings}
        />
        <AudioSelector
          label="Фоновый звук:"
          filePath={backgroundSoundUri}
          onSelectFile={() => handleSelectFile(setBackgroundSoundUri)}
          enabled={canEditSettings}
        />
        <View style={styles.switchContainer}>
          <Text style={[styles.label, (!backgroundSoundUri || !canEditSettings) && styles.disabledText]}>Включить фон:</Text>
          <Switch
            value={isBgSoundEnabled}
            onValueChange={setIsBgSoundEnabled}
            disabled={!backgroundSoundUri || !canEditSettings}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isBgSoundEnabled ? '#46a0f5' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
         <AudioSelector
          label="Звук окончания:"
          filePath={endSoundUri}
          onSelectFile={() => handleSelectFile(setEndSoundUri)}
          enabled={canEditSettings}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#121212',
    alignItems: 'center',
  },
  loadingText: {
     color: '#ccc',
     fontSize: 18,
     marginTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#eee',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    width: '80%',
  },
   inputContainerPlaceholder: {
      height: 50, // Примерная высота поля ввода (нужно подобрать точнее)
      marginBottom: 30,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10, // Уменьшаем вертикальный padding
    fontSize: 16,
    color: '#eee',
    marginRight: 10,
    height: 44, // Фиксируем высоту поля ввода
  },
  setInputButton: {
    paddingHorizontal: 15,
     height: 44, // Такая же высота, как у поля ввода
     justifyContent: 'center',
  },
  setInputButtonText: {
     fontSize: 16,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  audioSettingsContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingTop: 20,
    paddingBottom: 20, // Добавляем отступ снизу
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  label: {
     fontSize: 16,
     color: '#ccc',
  },
   disabledText: {
      color: '#777',
   },
});

export default MeditationScreen;
