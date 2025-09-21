import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Web-compatible storage
const WebStorage = {
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },

  async removeItem(key: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  }
};

// Use AsyncStorage on mobile, localStorage on web
export const Storage = Platform.OS === 'web' ? WebStorage : AsyncStorage;
