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
        const latDelta = Math.max(maxLat - minLat, 0.01) * 1.5 ;
        const lngDelta = Math.max(maxLng - minLng, 0.01) * 1.5 ;

        setRegion({
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: latDelta,
            longitudeDelta: lngDelta,
        });

    };

    const createRoute = ( ) =>{
        const coordinates = places.map(place => place.location)
        setRoute(coordinates);
    };

    // loop in colors
    const getMarkerColor = (index) => {
        const colors = [COLORS.primary, COLORS.secondary, COLORS.success]
        return colors[index % colors.length];

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
});
