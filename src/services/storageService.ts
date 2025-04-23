import AsyncStorage from '@react-native-async-storage/async-storage';

// Интерфейс для структуры настроек
export interface Settings {
  totalDurationSeconds?: number;
  startSoundUri?: string | null;
  backgroundSoundUri?: string | null;
  endSoundUri?: string | null;
  isBgSoundEnabled?: boolean;
}

const SETTINGS_KEY = '@MeditationApp:settings'; // Ключ для хранения настроек

// Сохранение настроек
export const saveSettings = async (settings: Settings): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(SETTINGS_KEY, jsonValue);
    console.log('Settings saved successfully.');
  } catch (e) {
    console.error('Error saving settings to AsyncStorage:', e);
    // Можно выбросить ошибку дальше или обработать здесь
    throw e;
  }
};

// Загрузка настроек
export const loadSettings = async (): Promise<Settings> => {
  try {
    const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
    if (jsonValue !== null) {
      const loadedSettings = JSON.parse(jsonValue) as Settings;
      console.log('Settings loaded successfully:', loadedSettings);
      return loadedSettings;
    } else {
      console.log('No settings found, returning defaults.');
      return {}; // Возвращаем пустой объект, если настроек нет
    }
  } catch (e) {
    console.error('Error loading settings from AsyncStorage:', e);
    return {}; // Возвращаем пустой объект в случае ошибки
  }
};

// Очистка настроек (если нужно)
export const clearSettings = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(SETTINGS_KEY);
        console.log('Settings cleared.');
    } catch (e) {
        console.error('Error clearing settings:', e);
        throw e;
    }
};
