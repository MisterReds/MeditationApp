import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native'; // Убрали View
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Закомментировано

interface ControlButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
  _iconName?: string; // Переименовали iconName в _iconName
  style?: object;
  textStyle?: object;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  title,
  onPress,
  disabled = false,
  color = '#007AFF',
  _iconName, // Используем переименованный пропс
  style,
  textStyle,
}) => {
  const buttonBackgroundColor = disabled ? '#555' : color;
  const buttonTextColor = disabled ? '#aaa' : '#fff';

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: buttonBackgroundColor }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1.0 : 0.7}
    >
      {/* Строки с иконкой пока закомментированы */}
      {/* {_iconName && <Icon name={_iconName} size={20} color={buttonTextColor} style={styles.icon} />} */}
      <Text style={[styles.buttonText, { color: buttonTextColor }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  icon: { // Стиль для иконки можно оставить на будущее
    marginRight: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ControlButton;
