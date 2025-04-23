import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import Storage from '../utils/storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import screens for each tab
import CompanyListScreen from './CompanyListScreen';
import CropListScreen from './CropListScreen';
import ArticleListScreen from './ArticleListScreen';

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      const jwt = await Storage.getItem('jwt');
      const user = await Storage.getItem('user');
      if (jwt) {
        setIsAuthenticated(true);
        if (user) {
          setUserName(JSON.parse(user).name || 'User');
        }
      } else {
        router.replace('/LoginScreen');
      }
    };

    checkAuthentication();
  }, [router]);

  const handleLogout = async () => {
    await Storage.removeItem('jwt');
    await Storage.removeItem('user');
    router.replace('/LoginScreen');
  };

  return (
    <ImageBackground 
      source={require('../assets/images/partial-react-logo.png')} 
      style={styles.background}
      blurRadius={2}
    >
      <View style={styles.overlay}>
        {isAuthenticated ? (
          <>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.userName}>{userName}</Text>
              </View>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Ionicons name="log-out-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Enhanced Bottom Tab Navigator */}
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName;

                  if (route.name === 'VerticalFarming') {
                    iconName = focused ? 'newspaper' : 'newspaper-outline';
                  } else if (route.name === 'Crop') {
                    iconName = focused ? 'leaf' : 'leaf-outline';
                  } else if (route.name === 'Companies') {
                    iconName = focused ? 'business' : 'business-outline';
                  }

                  return (
                    <View style={focused ? styles.activeTabIconContainer : styles.tabIconContainer}>
                      <Ionicons 
                        name={iconName} 
                        size={focused ? 26 : 24} 
                        color={focused ? '#2E7D32' : '#757575'}
                      />
                      {focused && <View style={styles.activeTabIndicator} />}
                    </View>
                  );
                },
                tabBarActiveTintColor: '#2E7D32',
                tabBarInactiveTintColor: '#757575',
                tabBarStyle: {
                  backgroundColor: 'white',
                  borderTopWidth: 0,
                  elevation: 10,
                  shadowOpacity: 0.1,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: -5 },
                  height: 80,
                  paddingBottom: 10,
                  paddingTop: 10,
                },
                tabBarItemStyle: {
                  height: 60,
                },
                tabBarLabelStyle: {
                  fontSize: 12,
                  marginBottom: 5,
                  fontWeight: '500',
                },
                headerShown: false,
              })}
            >
              <Tab.Screen 
                name="VerticalFarming" 
                component={ArticleListScreen} 
                options={{ 
                  tabBarLabel: 'Articles',
                }}
              />
              <Tab.Screen 
                name="Crop" 
                component={CropListScreen} 
                options={{ 
                  tabBarLabel: 'Crops',
                }}
              />
              <Tab.Screen 
                name="Companies" 
                component={CompanyListScreen} 
                options={{ 
                  tabBarLabel: 'Companies',
                }}
              />
            </Tab.Navigator>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <Ionicons name="leaf" size={50} color="#2E7D32" />
            <Text style={styles.loadingText}>Loading your farm data...</Text>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#2E7D32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  logoutButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: '500',
  },
  // New styles for enhanced bottom tab navigation
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  activeTabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
  },
});