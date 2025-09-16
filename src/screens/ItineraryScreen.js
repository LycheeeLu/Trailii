import React from "react";
import {View, Text, StyleSheet } from "react";
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
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ItineraryScreen;