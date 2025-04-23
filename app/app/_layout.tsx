import { DefaultTheme, DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import Storage from '../utils/storage';
import { useRouter } from 'expo-router';
import { Platform, useColorScheme } from 'react-native';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const jwt = await Storage.getItem('jwt');
      setIsAuthenticated(!!jwt);
      
      // Navigate based on auth status
      if (jwt) {
        router.replace('/HomeScreen');
      } else {
        router.replace('/LoginScreen');
      }
    };

    checkAuth();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="HomeScreen" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="LoginScreen" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="SignupScreen" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="articles/[slug]" 
          options={{ 
            title: 'Article',
            headerBackTitle: 'Back'
          }} 
        />

        <Stack.Screen 
          name="companies/[slug]" 
          options={{ 
            title: 'Company Details',
            headerBackTitle: 'Companies'
        }} 
        />
        <Stack.Screen 
          name="crops/[slug]" 
          options={{ 
            title: 'Crop Details',
            headerBackTitle: 'Companies'
        }} 
        />

      {/* Crop Screens */}
      <Stack.Screen 
        name="CropListScreen" 
        options={{ 
          title: 'Crops',
          headerBackTitle: 'Back'
        }} 
      />
      
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}