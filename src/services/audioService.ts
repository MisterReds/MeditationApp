import TrackPlayer, {
    Capability,
    RepeatMode,
    State as TrackPlayerState,
    Event as TrackPlayerEvent,
    usePlaybackState, // Хук для отслеживания состояния
    useProgress, // Хук для отслеживания прогресса
  } from 'react-native-track-player';

  let isPlayerSetup = false;

  // Настройка плеера
  export const setupAudioPlayer = async (): Promise<boolean> => {
    if (isPlayerSetup) {
      return true;
    }
    try {
      console.log('Setting up Track Player...');
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        // Возможности плеера (пауза, стоп и т.д.)
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
          // Capability.SeekTo, // Если нужна перемотка
        ],
        // Иконки для уведомления Android
        compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
         // Настройки уведомлений (опционально)
         // notificationCapabilities: [...],
         // android: { appKilledPlaybackBehavior: ... },
      });
      isPlayerSetup = true;
      console.log('Track Player setup complete.');
      return true;
    } catch (error) {
      console.error('Error setting up Track Player:', error);
      return false;
    }
  };

  // Проигрывание короткого звука (добавляем, играем, удаляем)
  export const playOneShot = async (uri: string) => {
    if (!isPlayerSetup) {await setupAudioPlayer();}
    if (!uri) {return;}

    try {
      console.log(`Playing one-shot: ${uri}`);
      await TrackPlayer.reset(); // Очищаем очередь перед проигрыванием
      await TrackPlayer.add({
        id: 'one-shot-' + Date.now(), // Уникальный ID
        url: uri,
        title: 'Meditation Sound',
        artist: 'App',
         // duration: можно указать, если известно
      });
      await TrackPlayer.setRepeatMode(RepeatMode.Off); // Без повтора
      await TrackPlayer.play();

      // Слушатель для удаления трека после завершения
      const subscription = TrackPlayer.addEventListener(TrackPlayerEvent.PlaybackQueueEnded, async (data) => {
          // Проверяем, действительно ли очередь пуста и воспроизведение остановлено
          if (data.position === 0 && data.track === null) {
              console.log('One-shot finished, resetting player.');
              await TrackPlayer.reset();
              subscription.remove(); // Удаляем слушателя
          } else if (data.position > 0 && data.track !== null) {
             // Иногда событие срабатывает преждевременно, если очередь не пуста - игнорируем
             console.log('PlaybackQueueEnded fired prematurely, ignoring.');
          }
      });

       // Дополнительная проверка через некоторое время, если событие не сработало
       setTimeout(async () => {
          try {
              const state = await TrackPlayer.getPlaybackState();
               const queue = await TrackPlayer.getQueue();
              if (state.state !== TrackPlayerState.Playing && queue.length > 0 && queue[0].id.startsWith('one-shot')) {
                  console.log('Force resetting player after one-shot timeout.');
                  await TrackPlayer.reset();
                   subscription?.remove(); // Попытка удалить слушателя
              }
          } catch(e) { /* ignore */ }
       }, 10000); // Например, через 10 секунд


    } catch (error) {
      console.error(`Error playing one-shot sound ${uri}:`, error);
      // Можно попытаться сбросить плеер в случае ошибки
       try { await TrackPlayer.reset(); } catch (e) {}
    }
  };

  // Проигрывание/возобновление фонового звука
  export const playBackground = async (uri: string, loop: boolean) => {
    if (!isPlayerSetup) {await setupAudioPlayer();}
    if (!uri) {return;}

    try {
      console.log(`Playing background: ${uri}, loop: ${loop}`);
      // Очищаем предыдущий фоновый трек, если он был другим
      const currentTrack = await TrackPlayer.getActiveTrack();
      if (currentTrack && currentTrack.url !== uri) {
         console.log('Resetting player for new background track.');
         await TrackPlayer.reset();
      }

      // Добавляем трек, только если его еще нет в очереди или очередь пуста
      const queue = await TrackPlayer.getQueue();
       if (queue.length === 0 || queue[0].url !== uri) {
          console.log('Adding background track to queue.');
         await TrackPlayer.add({
           id: 'background-track',
           url: uri,
           title: 'Background Sound',
           artist: 'App',
         });
       } else {
          console.log('Background track already in queue.');
       }

      await TrackPlayer.setRepeatMode(loop ? RepeatMode.Track : RepeatMode.Off);
      await TrackPlayer.play();
    } catch (error) {
      console.error(`Error playing background sound ${uri}:`, error);
    }
  };

  // Пауза фонового звука
  export const pauseBackground = async () => {
    if (!isPlayerSetup) {return;}
    try {
      const state = await TrackPlayer.getPlaybackState();
      if(state.state === TrackPlayerState.Playing) {
          console.log('Pausing background sound...');
          await TrackPlayer.pause();
      }
    } catch (error) {
      console.error('Error pausing background sound:', error);
    }
  };

  // Остановка и сброс фонового звука
  export const stopBackground = async () => {
    if (!isPlayerSetup) {return;}
    try {
      const state = await TrackPlayer.getPlaybackState();
      if(state.state !== TrackPlayerState.Stopped && state.state !== TrackPlayerState.None) {
         console.log('Stopping and resetting background sound...');
         await TrackPlayer.stop(); // Останавливаем воспроизведение
         await TrackPlayer.reset(); // Очищаем очередь и сбрасываем состояние
      }
    } catch (error) {
      console.error('Error stopping background sound:', error);
    }
  };

  // Освобождение ресурсов плеера
  export const destroyAudioPlayer = async () => {
    if (!isPlayerSetup) {return;}
    try {
      console.log('Destroying Track Player...');
      await TrackPlayer.destroy();
      isPlayerSetup = false;
    } catch (error) {
      console.error('Error destroying Track Player:', error);
    }
  };

  // Экспортируем хуки для использования в компонентах, если нужно
  export { usePlaybackState, useProgress };
