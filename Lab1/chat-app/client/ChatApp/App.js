import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import GroupScreen from './src/screens/GroupScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Welcome to Chat' }} 
        />
        <Stack.Screen 
          name="Group" 
          component={GroupScreen} 
          options={{ title: 'Group Chat' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App; 