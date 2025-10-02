import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import {COLORS, SIZES} from "../../constants/config";
import GooglePlacesService from "../../services/googlePlacesService";
import DurationSelector from "./DurationSelector";

const ItineraryItem = ({
    place,
    index,
    day,
    onDurationchange,
    onRemove,
    onDragStart,
    estimatedTime,
    isLast,
}) => {

    const handleRemove = () =>{
        Alert.alert(
            'Remove Spot',
            `Remove ${place.name} from itinerary?`,
            [
                {text: "Cancel", style: "cancel"},
                {text: "Remove",
                    style: "destructive",
                    onPress: () => onRemove(place) }
            ]
        );
    };

    const getImageUrl = () => {
      const photoRef = place.photos[0].photo_reference || place.photos[0].photoreference;
      const url = GooglePlacesService.getPhotoUrl(photoRef, 400);
        return url;
    };


    return (
        <View style = {styles.container}>
             {/* Time indicator
             10:00 AM- 11:0 AM */}
             {estimatedTime && (
                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>
                        {estimatedTime.arrival } - {estimatedTime.departure}
                    </Text>
                </View>
             )}

             <View style={styles.card}>
                  {/* Drag handle */}
{/*                   <TouchableOpacity
                    styles={styles.dragHandle}
                    onPressIn={()=> onDragStart && onDragStart(index)}
                    >
                        <Ionicons name="swap-vertical"
                            size={20}
                            color={COLORS.gray}
                            />
                    </TouchableOpacity> */}

                    {/* Place image */}
                    <View style={styles.imageContainer}>
                        {getImageUrl() ? (
                            <Image source={{url: getImageUrl()}}
                            style={styles.placeImage}>
                            </Image>
                        ) : (
                            <View style={[styles.placeImage, styles.placeholderImage]}>
                                <Ionicons name="image-outline"
                                    size={24}
                                    color={COLORS.gray}
                                />
                             </View>
                        )}
                    </View>


                   {/* Place info */}
                   <View style={styles.infoContainer}>
                    <Text style={styles.placeName}
                        numberOfLines={1}>
                            {place.name}
                    </Text>
                    <Text style={styles.placeAddress}
                        numberOfLines={3}>
                            {place.address}
                        </Text>

                    <DurationSelector
                        duration ={place.visitDuration || 60}
                        onDurationChange={(duration)=> onDurationchange(index, duration)}
                        style={styles.durationSelector}
                    />
                   </View>

                {/* Remove button */}
                <TouchableOpacity
                    style ={styles.removeButton}
                    onPress = {handleRemove}
                >
                    <Ionicons name="close-circle"
                        size={20}
                        color={COLORS.danger}
                    />
                </TouchableOpacity>
            </View>
             {/* Connection line to next item */}
             {! isLast && <View style={styles.connectionLine} />}

        </View>
    );
};

const styles = StyleSheet.create({
     container: {
    marginBottom: 5,
  },
  timeContainer: {
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    alignItems: 'center',
  },
  dragHandle: {
    padding: 8,
    marginRight: 8,
  },
  imageContainer: {
    marginRight: 12,
  },
  placeImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 2,
  },
  placeAddress: {
    fontSize: 10,
    color: COLORS.gray,
    marginBottom: 8,
  },
  durationSelector: {
    flex: 0,
    minWidth: 80,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  connectionLine: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.primary + '30',
    marginLeft: 35,
    marginTop: 10,
  },

}
);

export default ItineraryItem;
