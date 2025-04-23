import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const growAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 2,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(growAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ]).start();

    // Navigate after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/LoginScreen');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <LinearGradient
      colors={['#e8f5e9', '#c8e6c9', '#a5d6a7']}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Animated.View style={{ transform: [{ scale: growAnim }] }}>
          <MaterialCommunityIcons 
            name="sprout" 
            size={80} 
            color="#2e7d32" 
            style={styles.icon}
          />
        </Animated.View>
        <Text style={styles.text}>VertiGrow</Text>
        <Text style={styles.subtitle}>Cultivating Growth</Text>
      </Animated.View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Loading your vertical farming experience...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 100,
  },
  icon: {
    marginBottom: 20,
  },
  text: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#81c784',
    marginTop: 5,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    color: '#2e7d32',
    opacity: 0.7,
  },
});