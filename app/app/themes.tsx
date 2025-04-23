// app/themes.tsx
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2E7D32', // Your green color
    background: '#f8fff8', // Light green background
    card: '#ffffff', // White cards
    text: '#212529', // Dark text
    border: '#e0e0e0', // Light border
    notification: '#ff3b30', // Red for notifications
  },
};

export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#81C784', // Lighter green for dark mode
    background: '#121212', // Dark background
    card: '#1E1E1E', // Dark cards
    text: '#ffffff', // White text
    border: '#333333', // Dark border
    notification: '#ff453a', // Red for notifications
  },
};