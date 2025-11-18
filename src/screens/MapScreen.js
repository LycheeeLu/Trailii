import React, {useState, useEffect, useCallback} from "react";
import {View, Text, StyleSheet, Alert} from "react-native";
import { COLORS } from "../constants/config";
import MapView, {Marker} from "react-native-maps";
import * as Location from 'expo-location';
import googePlacesService from "../services/googlePlacesService";
import SearchBar from "../components/map/SearchBar";
import PlaceCard from "../components/places/PlaceCard";

console.log('Location object:', Location);
console.log('SearchBar component:', SearchBar);
console.log('googePlacesService object:', googePlacesService);


const HELSINKI_REGION = {
    latitude: 60.1699,
    longitude: 24.9384,
    latitudeDelta: 0.010,
    longitudeDelta: 0.010,
};

const MapScreen = () => {
    const [location, setLocation] = useState(null);
    const [region, setRegion] = useState(null);
    const [places, setPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [showPlaceCard, setShowPlaceCard] = useState(false);
    const [hasPromptedForPermission, setHasPromptedForPermission] = useState(false);

    const loadNearbyPlaces = useCallback(async (latitude, longitude) => {
        try {
            const nearbyPlaces = await googePlacesService.searchNearby(latitude, longitude, 10000);
            setPlaces(nearbyPlaces);
        } catch (error) {
            console.error('Error loading nearby places:', error);
        }
    }, []);

    const fetchLocation = useCallback(async () => {
        try {
            const {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Location permission required','Please enable it to use your current position. Showing Helsinki by default.');
                setRegion(HELSINKI_REGION);
                return;
            }

            const currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);

            const newRegion = {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.010,
                longitudeDelta: 0.010,
            };
            setRegion(newRegion);

            // load nearby places using the real coordinates
            loadNearbyPlaces(currentLocation.coords.latitude, currentLocation.coords.longitude);
        } catch (error) {
            console.error('Error getting user location:', error);
            Alert.alert('Unable to fetch location','Showing Helsinki by default.');
            setRegion(HELSINKI_REGION);
        }
    }, [loadNearbyPlaces]);

    useEffect(() => {
        if (!hasPromptedForPermission) {
            Alert.alert(
                'Allow location access',
                'Trailii needs access to your location to show nearby places. Continue to choose whether to grant permission.',
                [
                    {
                        text: 'Continue',
                        onPress: () => {
                            setHasPromptedForPermission(true);
                            fetchLocation();
                        },
                    },
                ],
                {cancelable: false},
            );
        }
    }, [hasPromptedForPermission, fetchLocation]);
    const handlePlaceSelect = (place) => {
        setSelectedPlace(place);
        setShowPlaceCard(true);

        // move map to selected place
        const newRegion = {
            latitude: place.location.latitude,
            longitude: place.location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };
        setRegion(newRegion);


        //add to places (if not there)
        if (!places.find(p => p.id === place.id)){
            setPlaces([...places, place]);
        }

     };

     const handleMarkerPress = (place) => {
        handlePlaceSelect(place);
        setShowPlaceCard(true);
     }

     const handleMapPress = (event) => {
        console.log("Handle Map pressed!", event);
        setShowPlaceCard(false);

        //maybe reverse geocode?
        // tap on an address and then add to places
        // so that we can create custom place
        setSelectedPlace(null);
     };


     const handleClosePlaceCard = () => {
        setShowPlaceCard(false);
        setSelectedPlace(null);
     };




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
                onPress = {handleMapPress}
            >

                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                        title="You are here"
                        pinColor={COLORS.success}
                    />
                )}

                 {/* Place markers */}
                { places.map((place) => (
                        <Marker
                            key={place.id}
                            coordinate={place.location}
                            title={place.name}
                            description={place.address}
                            pinColor={selectedPlace && selectedPlace.id === place.id ? COLORS.primary : COLORS.secondary}
                            onPress = {() => handlePlaceSelect(place)}
                        />
                ))}

            </MapView>


            <SearchBar
                onPlaceSelect={handlePlaceSelect}
                currentLocation = {region}
            />

             {/* Place Card Modal */}
             <PlaceCard
                place={selectedPlace}
                visible={showPlaceCard}
                onClose={handleClosePlaceCard}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
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
        backgroundColor: COLORS.surface,
    }
});



export default MapScreen;
