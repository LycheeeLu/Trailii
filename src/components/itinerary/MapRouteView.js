import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/config';
import chroma from 'chroma-js';

// a component that display a header and a mapview
// header : day 1 route + [x]arrow
// mapview: places marked with Marker, connected with Polyline
// autoresize map region

const MapRouteView = ({visible, onClose, places, day}) =>{
    const [region, setRegion] = useState(null);
    const [route, setRoute] = useState([]);

    useEffect(()=>{
        if (visible && places.length > 0){
            calculateRegion();
            createRoute();
        }
        console.log("📍 places passed into MapRouteView:", places);
        console.log("✅ mapped coordinates:", places.map(p => p?.location));
    },[visible, places]);


    const calculateRegion = () => {
        if (places.length === 0) return;

        /* const places = [
        {
            name: "Eiffel Tower",
            location: { latitude: 48.8584, longitude: 2.2945 }
        },
        {
            name: "Louvre Museum",
            location: { latitude: 48.8606, longitude: 2.3376 }
        },
        {
            name: "Notre Dame",
            location: { latitude: 48.8529, longitude: 2.3500 }
        }
        ]; */

        /*coordinates = [
        { latitude: 48.8584, longitude: 2.2945 },
        { latitude: 48.8606, longitude: 2.3376 },
        { latitude: 48.8529, longitude: 2.3500 }
        ]; */

        const coordinates = places.map(place => place.location)
        const minLat = Math.min(...coordinates.map(coord => coord.latitude));
        const maxLat = Math.max(...coordinates.map(coord => coord.latitude));
        const minLng = Math.min(...coordinates.map(coord => coord.longitude));
        const maxLng = Math.max(...coordinates.map(coord => coord.longitude));

        // bounding box * 1.5
        const latDelta = Math.max(maxLat - minLat, 0.01) * 2.0 ;
        const lngDelta = Math.max(maxLng - minLng, 0.01) * 2.0 ;

        setRegion({
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: latDelta,
            longitudeDelta: lngDelta,
        });

    };

    // route is created here, it only contains coordinates, latitude andlongtidue
    // might not sync with places data struct
    const createRoute = ( ) =>{
        const coordinates = places.map(place => place.location)
        setRoute(coordinates);
    };

    const gradient = chroma.scale(['orange', 'orchid']).mode('lab');

    // loop in colors
    const getMarkerColor = (index, total) => {
        const ratio = total > 1 ? index / (total - 1) : 0;
        return gradient(ratio).hex();

    };

    if (!visible || ! region) return null;

    return (
        <Modal
            animationType='slide'
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                 {/* Header */}
                 <View style={styles.header}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeButton}>
                            <Ionicons name="arrow-back"
                                size={24}
                                color={COLORS.white}
                                />
                        </TouchableOpacity>
                        <Text style={styles.title}>
                            {day?.replace('day', 'Day ')} Route
                        </Text>
                 </View>

                 <MapView style={styles.map} region={region}  showsUserLocation={true}>
                 {/* Place markers */}
                  {places.map((place, index) => (
                    <Marker
                      key={`${place.id}_${index}`}
                      coordinate={place.location}
                      title={`${index + 1}. ${place.name}`}
                      description={`Visit duration: ${place.visitDuration || 60} min`}
                      pinColor={getMarkerColor(index, places.length)}
                    >
                      <View style={[styles.customMarker, { backgroundColor: getMarkerColor(index) }]}>
                        <Text style={styles.markerText}>{index + 1}</Text>
                      </View>
                    </Marker>
                  ))}
                  <Polyline coordinates={route} strokeWidth={3} strokeColor={COLORS.primary} lineDashPattern={[4, 4]} />
                </MapView>

            </View>

        </Modal>


    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  map: {
    flex: 1,
  },
  markerLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  customMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
    markerText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default MapRouteView;