import { Platform } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  PermissionStatus,
  // openSettings, // <-- Удален неиспользуемый импорт
} from 'react-native-permissions';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';

export const requestAudioPermission = async (): Promise<boolean> => {
  let permission: typeof PERMISSIONS.ANDROID.READ_MEDIA_AUDIO | typeof PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE | typeof PERMISSIONS.IOS.MEDIA_LIBRARY; // Добавляем тип для iOS

  if (Platform.OS === 'android') {
    permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE; // Оставляем пока этот для простоты
    console.log(`Requesting permission: ${permission}`);
  } else if (Platform.OS === 'ios') {
    permission = PERMISSIONS.IOS.MEDIA_LIBRARY;
    console.log(`Requesting permission: ${permission}`);
  } else {
    console.log('Unsupported platform for permissions.');
    return true;
  }

  try {
    let status: PermissionStatus = await check(permission);
    console.log(`Initial permission status for ${permission}: ${status}`);

    if (status === RESULTS.GRANTED) {
      return true;
    }

    if (status === RESULTS.DENIED) {
       console.log('Permission denied, requesting again...');
       status = await request(permission);
       console.log(`Status after request: ${status}`);
       return status === RESULTS.GRANTED;
    }

    if (status === RESULTS.BLOCKED || status === RESULTS.LIMITED) {
      console.log('Permission blocked or limited. Suggest opening settings.');
      // Alert.alert('Разрешение заблокировано', '...', [{ text: 'Открыть настройки', onPress: openSettings }...]); // openSettings удален
      return false;
    }

    if (status === RESULTS.UNAVAILABLE) {
        console.log('Permission unavailable on this device.');
        return false;
    }

    status = await request(permission);
    return status === RESULTS.GRANTED;

  } catch (error) {
    console.error(`Error requesting permission ${permission}:`, error);
    return false;
  }
};

export const pickAudioFile = async (): Promise<string | null> => {
   console.log('Attempting to pick audio file...');
   try {
     const pickerResponse: DocumentPickerResponse[] = await DocumentPicker.pick({
       type: [DocumentPicker.types.audio],
       copyTo: 'cachesDirectory',
       mode: 'open',
       allowMultiSelection: false,
     });

     if (pickerResponse && pickerResponse.length > 0 && pickerResponse[0].uri) {
       const fileUri = pickerResponse[0].uri;
       console.log(`File picked: ${fileUri}`);
        const filePath = pickerResponse[0].fileCopyUri || fileUri;
        console.log(`Using path for player: ${filePath}`);
       return filePath;
     } else {
       console.log('No file selected or picker response invalid.');
       return null;
     }
   } catch (error: any) {
        if (DocumentPicker.isCancel(error)) {
             console.log('User cancelled the file picker.');
        } else {
            console.error('Error picking document:', error);
        }
        return null;
   }
};
