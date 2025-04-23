// Форматирует количество секунд в строку MM:SS
export const formatDuration = (totalSeconds: number): string => {
    // Обработка нечисловых или отрицательных значений
    if (isNaN(totalSeconds) || totalSeconds < 0) {
      return '00:00';
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60); // Убедимся, что секунды целые

    // Добавляет ведущий ноль, если число < 10
    const pad = (num: number): string => num.toString().padStart(2, '0');

    return `${pad(minutes)}:${pad(seconds)}`;
  };
