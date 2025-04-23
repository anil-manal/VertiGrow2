import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import axios from '../utils/axios';
import Storage from '../utils/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Animation refs
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const fadeValue = React.useRef(new Animated.Value(0)).current;
  const slideValue = React.useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideValue, {
        toValue: 0,
        damping: 10,
        useNativeDriver: true,
      })
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async () => {
    if (isLoading) return;
    
    if (!username || !password) {
      showErrorAnimation();
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/auth/local', {
        identifier: username,
        password,
      });

      if (response.data?.jwt) {
        await Storage.setItem('jwt', response.data.jwt);
        router.replace('/HomeScreen');
      }
    } catch (error) {
      console.error('Login error:', error);
      showErrorAnimation();
      alert('Invalid credentials, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showErrorAnimation = () => {
    Animated.sequence([
      Animated.timing(slideValue, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(slideValue, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.spring(slideValue, {
        toValue: 0,
        damping: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <LinearGradient
      colors={['#e8f5e9', '#c8e6c9', '#a5d6a7']}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.animatedContainer,
          { 
            opacity: fadeValue,
            transform: [{ translateY: slideValue }],
          }
        ]}
      >
        <MaterialCommunityIcons 
          name="sprout" 
          size={80} 
          color="#2e7d32" 
          style={styles.logoIcon}
        />
        
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Continue your VertiGrow journey</Text>
        
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={24} color="#2e7d32" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#81c784"
            value={username}
            onChangeText={setUsername}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            editable={!isLoading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={24} color="#2e7d32" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#81c784"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            editable={!isLoading}
          />
        </View>
        
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'LOGGING IN...' : 'LOGIN'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        
        <TouchableOpacity 
          onPress={() => router.push('/SignupScreen')}
          style={styles.signupLinkContainer}
          disabled={isLoading}
        >
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupLink}>Sign up</Text>
          </Text>
        </TouchableOpacity>
        
        <View style={styles.plantsContainer}>
          <MaterialCommunityIcons 
            name="leaf" 
            size={40} 
            color="#2e7d32" 
            style={[styles.plantIcon, styles.plantLeft]} 
          />
          <MaterialCommunityIcons 
            name="sprout-outline" 
            size={60} 
            color="#388e3c" 
            style={styles.plantCenter} 
          />
          <MaterialCommunityIcons 
            name="leaf" 
            size={40} 
            color="#2e7d32" 
            style={[styles.plantIcon, styles.plantRight]} 
          />
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  animatedContainer: {
    width: '100%',
    alignItems: 'center',
  },
  logoIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'Roboto',
  },
  subtitle: {
    fontSize: 16,
    color: '#81c784',
    marginBottom: 30,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'Roboto',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#2e7d32',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'Roboto',
    marginLeft: 10,
  },
  loginButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'Roboto',
  },
  signupLinkContainer: {
    marginTop: 20,
  },
  signupText: {
    color: '#81c784',
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'Roboto',
  },
  signupLink: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  plantsContainer: {
    flexDirection: 'row',
    marginTop: 40,
    alignItems: 'flex-end',
    height: 80,
  },
  plantIcon: {
    opacity: 0.8,
  },
  plantLeft: {
    transform: [{ rotate: '-30deg' }],
    marginRight: -15,
  },
  plantCenter: {
    zIndex: 1,
  },
  plantRight: {
    transform: [{ rotate: '30deg' }],
    marginLeft: -15,
  },
});

export default LoginScreen;