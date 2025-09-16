import React from "react";
import {View, Text, StyleSheet} from "react-native";
import { COLORS } from "../constants/config";

const MapScreen = () =>{

    return(
        <View style={styles.container}>
            <Text>Map Screen</Text>
        </View>
    );
};


const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MapScreen;