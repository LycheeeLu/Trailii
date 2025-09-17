import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import ItineraryScreen from './src/screens/ItineraryScreen';
import MapScreen from './src/screens/MapScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TripProvider } from './src/contexts/TripContext';
import { COLORS } from './src/constants/config';


const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <TripProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Itinerary') {
                iconName = focused
                  ? 'list'
                  : 'list-outline';
              } else if (route.name === 'Map') {
                iconName = focused ? 'map' : 'map-outline';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.gray,
            headerStyle: { backgroundColor: COLORS.background },
            headerTitleStyle: { fontWeight: 'bold' },
            headerTintColor: COLORS.primary,
          })}
        >
          <Tab.Screen name="Itinerary" component={ItineraryScreen} />
          <Tab.Screen name="Map" component={MapScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      </TripProvider>

  );
}

