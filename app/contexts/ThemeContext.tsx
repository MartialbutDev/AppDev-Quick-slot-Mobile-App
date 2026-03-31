import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

// Color schemes for light and dark mode
export const lightColors = {
  background: '#fff',
  surface: '#fff',
  text: '#1a1a1a',
  textSecondary: '#666',
  border: '#f0f0f0',
  primary: '#007AFF',
  card: '#fff',
  shadow: '#000',
  notificationBadge: '#FF3B30',
  rating: '#FFD700',
  categoryIcon: '#f0f8ff',
  gadgetTag: '#f8f9fa',
  rateBadge: '#f0f8ff',
  inputBackground: '#f8f9fa',
  placeholder: '#999',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  headerBackground: '#0d1b3a',  // Dark navy blue
  //'#0b2b2c',
};

export const darkColors = {
  background: '#121212',
  surface: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  border: '#2d2d2d',
  primary: '#0a84ff',
  card: '#2d2d2d',
  shadow: '#000',
  notificationBadge: '#FF453A',
  rating: '#FFD700',
  categoryIcon: '#1a3a5f',
  gadgetTag: '#2a2a2a',
  rateBadge: '#1a3a5f',
  inputBackground: '#2d2d2d',
  placeholder: '#888',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  headerBackground:'#0d1b3a',  // Dark navy blue
  //'#0a1a1a',
};

interface ThemeContextType {
  isDarkMode: boolean;
  colors: typeof lightColors | typeof darkColors;
  toggleDarkMode: () => void;
  setDarkMode: (darkMode: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference on app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      } else {
        // Use System preference if no saved preference
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
      setIsDarkMode(systemColorScheme === 'dark');
    }
  };

  const saveThemePreference = async (darkMode: boolean) => {
    try {
      await AsyncStorage.setItem('themePreference', darkMode ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    saveThemePreference(newDarkMode);
  };

  const setDarkMode = (darkMode: boolean) => {
    setIsDarkMode(darkMode);
    saveThemePreference(darkMode);
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, colors, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};