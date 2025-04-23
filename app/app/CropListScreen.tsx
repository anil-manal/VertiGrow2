// app/CropListScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CropListScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crop List</Text>
      {/* Add your crop list content here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default CropListScreen;
