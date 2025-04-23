// First, create a new file PlanCropScreen.tsx in your app directory
// app/PlanCropScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PlanCropScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plan Your Crop</Text>
      {/* Add your crop planning content here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default PlanCropScreen;