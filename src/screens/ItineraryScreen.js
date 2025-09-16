import React from "react";
import {View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/config";


const ItineraryScreen = () =>{

    return(
        <View style={styles.container}>
            <Text>Itinerary Screen</Text>
        </View>
    );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
});

export default ItineraryScreen;