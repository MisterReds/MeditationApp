import React, {useEffect} from 'react';
import {SafeAreaView, StatusBar, LogBox} from 'react-native'; // Убрали StyleSheet
import MeditationScreen from './src/screens/MeditationScreen';
import {setupAudioPlayer, destroyAudioPlayer} from './src/services/audioService';

LogBox.ignoreLogs(['Setting a timer']);

function App(): React.JSX.Element {
  const isDarkMode = true;

  useEffect(() => {
    setupAudioPlayer();
    return () => {
      destroyAudioPlayer();
    };
  }, []);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#F3F3F3',
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <MeditationScreen />
    </SafeAreaView>
  );
}

// Блок styles удален

export default App;
