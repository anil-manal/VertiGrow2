// utils/storage.ts
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Storage = {
  // Save item based on platform (AsyncStorage for mobile, localStorage for web)
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      // Trigger storage event to notify other tabs
      window.dispatchEvent(new Event('storage'));
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },

  // Get item based on platform (AsyncStorage for mobile, localStorage for web)
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  },

  // Remove item based on platform (AsyncStorage for mobile, localStorage for web)
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      // Trigger storage event to notify other tabs
      window.dispatchEvent(new Event('storage'));
    } else {
      await AsyncStorage.removeItem(key);
    }
  }
};

export default Storage;
