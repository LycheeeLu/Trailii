import React, {useState, useEffect} from "react";
import {View, Text, StyleSheet, Alert} from "react-native";
import { COLORS } from "../constants/config";
//import MapView, { Marker} from 'expo-maps';
import MapView, {Marker} from "react-native-maps";
import * as Location from 'expo-location';


const MapScreen = () => {
    const [location, setLocation] = useState(null);
    const [region, setRegion] = useState(null);

    useEffect(() => {
        (async () => {
            let {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied','Please enable it to use map');

                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);
            setRegion({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.001,
                longitudeDelta: 0.001,
            });

        })();
    }, []);

    if (!region){
        return (
            <View style={styles.container}>
                <Text>Loading map...</Text>
            </View>
        )
    }



    return(
        <View style={styles.container}>
            <MapView
                style = {styles.map}
                region = { region}
                showUserLocation = {true}
                showMyLocationButton = {true}
            >
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                        title="You are here"
                        pinColor={COLORS.primary}
                    />
                )}

            </MapView>
        </View>
    );
};


const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent: 'center',
        backgroundColor: COLORS.background,
        alignItems: 'center',
    },

    map:{
        flex: 1,
        borderColor: COLORS.border,
        borderWidth: 1,
        width: '100%',

    },

    loadingContainer:{
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    }
});



export default MapScreen;