import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Storage from '../utils/storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Import screens for each tab
import CompanyListScreen from './CompanyListScreen';
import CropListScreen from './CropListScreen';
import ArticleListScreen from './ArticleListScreen';
import PlanCropScreen from './PlanCropScreen';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

const HomeTabContent = () => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const cardAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(cardAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const cardScale = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1]
  });

  const cardOpacity = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  const PlantLayer = () => (
    <View style={styles.plantLayer}>
      <Ionicons name="leaf" size={40} color="rgba(46, 125, 50, 0.15)" style={styles.plant1} />
      <Ionicons name="leaf" size={60} color="rgba(46, 125, 50, 0.1)" style={styles.plant2} />
      <Ionicons name="leaf" size={50} color="rgba(46, 125, 50, 0.2)" style={styles.plant3} />
      <Ionicons name="leaf" size={70} color="rgba(46, 125, 50, 0.1)" style={styles.plant4} />
    </View>
  );

  return (
    <Animated.View style={[styles.homeContent, { opacity: fadeAnim }]}>
      <PlantLayer />
      
      <Animated.View style={[styles.glassCard, {
        transform: [{ scale: cardScale }],
        opacity: cardOpacity
      }]}>
        <Ionicons name="leaf" size={60} color="#2E7D32" style={styles.mainIcon} />
        <Text style={styles.welcomeTitle}>Vertical Farming Hub</Text>
        <Text style={styles.welcomeText}>
          Your gateway to sustainable agriculture. Monitor, learn, and grow with cutting-edge vertical farming techniques.
        </Text>
      </Animated.View>

      <View style={styles.statsGrid}>
        {['water-outline', 'sunny-outline', 'speedometer-outline', 'location-outline'].map((icon, index) => (
          <Animated.View 
            key={icon}
            style={[styles.statCard, {
              transform: [{
                scale: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1]
                })
              }],
              opacity: cardAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1]
              })
            }]}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name={icon} size={24} color="white" />
            </View>
            <Text style={styles.statTitle}>
              {['Water Efficiency', 'Energy Use', 'Growth Rate', 'Space Needed'][index]}
            </Text>
            <Text style={styles.statValue}>
              {['90% Saved', '70% Less', '3x Faster', '90% Less'][index]}
            </Text>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuAnim] = useState(new Animated.Value(0));
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      const jwt = await Storage.getItem('jwt');
      if (jwt) {
        setIsAuthenticated(true);
      } else {
        router.replace('/LoginScreen');
      }
    };
    checkAuthentication();
  }, [router]);

  const toggleMenu = () => {
    Animated.spring(menuAnim, {
      toValue: isMenuOpen ? 0 : 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
    setIsMenuOpen(!isMenuOpen);
  };

  const menuTranslateX = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.7, 0]
  });

  const handleNavigation = (screen: string) => {
    toggleMenu();
    router.push(screen);
  };

  const handleLogout = async () => {
    await Storage.removeItem('jwt');
    await Storage.removeItem('user');
    router.replace('/LoginScreen');
  };

  return (
    <LinearGradient
      colors={['#f8fff8', '#e8f5e9', '#d0ebd2']}
      style={styles.container}
    >
      {isAuthenticated ? (
        <>
          {/* Slim header with left-aligned hamburger menu */}
          <View style={styles.header}>
            <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
              <Ionicons name="menu" size={28} color="#2E7D32" />
            </TouchableOpacity>
          </View>

          {/* Side menu with increased opacity */}
          <Animated.View style={[styles.menuContainer, {
            transform: [{ translateX: menuTranslateX }],
          }]}>
            <BlurView intensity={50} tint="light" style={styles.menuBlur}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleNavigation('/HomeScreen')}
              >
                <Ionicons name="home-outline" size={24} color="#2E7D32" />
                <Text style={styles.menuText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleNavigation('/FAQ')}
              >
                <Ionicons name="help-circle-outline" size={24} color="#2E7D32" />
                <Text style={styles.menuText}>FAQ</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleNavigation('/Settings')}
              >
                <Ionicons name="settings-outline" size={24} color="#2E7D32" />
                <Text style={styles.menuText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleNavigation('/About')}
              >
                <Ionicons name="information-circle-outline" size={24} color="#2E7D32" />
                <Text style={styles.menuText}>About</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={24} color="#2E7D32" />
                <Text style={styles.menuText}>Logout</Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>

          {/* Tab Navigator */}
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused }) => {
                let iconName;
                let iconColor = focused ? '#2E7D32' : '#757575';

                switch (route.name) {
                  case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
                  case 'Articles': iconName = focused ? 'newspaper' : 'newspaper-outline'; break;
                  case 'PlanCrop': iconName = focused ? 'create' : 'create-outline'; break;
                  case 'Crops': iconName = focused ? 'leaf' : 'leaf-outline'; break;
                  case 'Companies': iconName = focused ? 'business' : 'business-outline'; break;
                }

                return (
                  <Animated.View style={[
                    styles.tabIconContainer,
                    focused && {
                      transform: [{
                        scale: focused ? 1.2 : 1
                      }]
                    }
                  ]}>
                    <Ionicons name={iconName} size={24} color={iconColor} />
                    {focused && (
                      <Animated.View style={[
                        styles.activeTabIndicator,
                        {
                          width: focused ? 24 : 0,
                          height: focused ? 3 : 0,
                        }
                      ]}/>
                    )}
                  </Animated.View>
                );
              },
              tabBarActiveTintColor: '#2E7D32',
              tabBarInactiveTintColor: '#757575',
              tabBarStyle: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderTopWidth: 0,
                height: Platform.OS === 'ios' ? 90 : 80,
                paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                paddingTop: 10,
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                elevation: 0,
                shadowOpacity: 0,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                overflow: 'hidden',
              },
              tabBarBackground: () => (
                <BlurView 
                  intensity={30} 
                  tint="light" 
                  style={StyleSheet.absoluteFill} 
                />
              ),
              tabBarItemStyle: {
                height: 60,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                marginBottom: Platform.OS === 'ios' ? 15 : 5,
                fontWeight: '500',
              },
              headerShown: false,
            })}
          >
            <Tab.Screen name="Home" component={HomeTabContent} />
            <Tab.Screen name="Articles" component={ArticleListScreen} />
            <Tab.Screen name="PlanCrop" component={PlanCropScreen} />
            <Tab.Screen name="Crops" component={CropListScreen} />
            <Tab.Screen name="Companies" component={CompanyListScreen} />
          </Tab.Navigator>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <Ionicons name="leaf" size={50} color="#2E7D32" style={styles.loadingIcon} />
          <Text style={styles.loadingText}>Loading your farm data...</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60, // Reduced height
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(46, 125, 50, 0.15)', // Light green background
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  menuButton: {
    padding: 8,
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    width: width * 0.7,
    height: '100%',
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Increased opacity
    borderRightWidth: 1,
    borderRightColor: 'rgba(46, 125, 50, 0.1)',
  },
  menuBlur: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(46, 125, 50, 0.1)',
  },
  menuText: {
    marginLeft: 15,
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: '500',
  },
  homeContent: {
    flex: 1,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  plantLayer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  plant1: {
    position: 'absolute',
    top: '10%',
    left: '5%',
    transform: [{ rotate: '-30deg' }],
  },
  plant2: {
    position: 'absolute',
    top: '25%',
    right: '10%',
    transform: [{ rotate: '45deg' }],
  },
  plant3: {
    position: 'absolute',
    bottom: '20%',
    left: '15%',
    transform: [{ rotate: '15deg' }],
  },
  plant4: {
    position: 'absolute',
    bottom: '30%',
    right: '5%',
    transform: [{ rotate: '-15deg' }],
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    zIndex: 1,
  },
  mainIcon: {
    alignSelf: 'center',
    marginBottom: 15,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statCard: {
    width: width / 2 - 30,
    backgroundColor: 'rgba(46, 125, 50, 0.8)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingTop: 5,
  },
  activeTabIndicator: {
    backgroundColor: '#2E7D32',
    borderRadius: 3,
    marginTop: 5,
  },
});