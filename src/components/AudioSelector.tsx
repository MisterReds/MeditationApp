import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface AudioSelectorProps {
  label: string;
  filePath: string | null;
  onSelectFile: () => void; // Функция, вызываемая при нажатии "Выбрать"
  enabled?: boolean;
}

const AudioSelector: React.FC<AudioSelectorProps> = ({
  label,
  filePath,
  onSelectFile,
  enabled = true,
}) => {
  // Получаем только имя файла из URI/пути
  const getFileName = (path: string | null): string => {
    if (!path) {
      return 'Не выбрано';
    }
    // Пытаемся извлечь имя файла после последнего '/' или '\'
    const decodedPath = decodeURIComponent(path); // Декодируем URI, если нужно
    const lastSlashIndex = Math.max(decodedPath.lastIndexOf('/'), decodedPath.lastIndexOf('\\'));
    return lastSlashIndex >= 0 ? decodedPath.substring(lastSlashIndex + 1) : decodedPath;
  };

  const displayFileName = getFileName(filePath);
  const isSelected = filePath !== null && filePath !== '';
  const textColor = enabled ? (isSelected ? '#eee' : '#aaa') : '#777';
  const buttonTextColor = enabled ? '#fff' : '#aaa';
  const buttonBackgroundColor = enabled ? '#007AFF' : '#555'; // Синий или серый

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]} numberOfLines={1} ellipsizeMode="middle">
        {label}{' '}
        <Text style={isSelected ? styles.fileNameSelected : styles.fileNameNotSelected}>
          {displayFileName}
        </Text>
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonBackgroundColor }]}
        onPress={onSelectFile}
        disabled={!enabled}
        activeOpacity={enabled ? 0.7 : 1.0}
      >
        <Text style={[styles.buttonText, { color: buttonTextColor }]}>Выбрать</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    width: '100%',
  },
  label: {
    fontSize: 16,
    flexShrink: 1, // Позволяет тексту сжиматься
    marginRight: 10,
  },
  fileNameSelected: {
    fontWeight: 'normal', // Обычный шрифт, если выбрано
     // color: '#eee', // Цвет уже задан через textColor
  },
   fileNameNotSelected: {
     fontStyle: 'italic', // Курсив, если не выбрано
      // color: '#aaa', // Цвет уже задан через textColor
   },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80, // Минимальная ширина кнопки
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AudioSelector;
