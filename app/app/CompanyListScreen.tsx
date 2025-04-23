// app/CompanyListScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CompanyListScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Company List</Text>
      {/* Add your company list content here */}
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

export default CompanyListScreen;
