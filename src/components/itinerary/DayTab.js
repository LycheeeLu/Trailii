import React from "react";
import {COLORS, SIZES} from "../../constants/config";
import { useTrip } from "../../contexts/TripContext";
import ItineraryItem from "./ItineraryItem";
import MapRouteView from "./MapRouteView";
import { Ionicons } from "@expo/vector-icons";
import { FlatList } from "react-native-web";
import { TouchableOpacity, StyleSheet, View } from "react-native";

const DayTab = ({day, places, onReorder, estimatedTimes}) => {
    const [showMapRoute, setShowMapRoute] = useState(false);
    const {removeFromDay, updatePlaceDuraiton} = useTrip();

    const handleRemovePlace = (place) => {
        removeFromDay(day, place)
    };

    const handleDurationChange = (placeIndex, duration) =>{
        updatePlaceDuraiton(day, placeIndex, duration);
    };

    const handleDragStart = (fromIndex) => {
        //add buttons to move up/down
    }


    //places = ["A", "B", "C", "D"];
    //movePlace(1, "down");
    const movePlace = (fromIndex, direction) => {
        //direction = "down" → toIndex = 1 + 1
        const toIndex = direction === 'up'? fromIndex - 1 : fromIndex + 1;
        if (toIndex < 0 || toIndex >= places.length) return;
        //newPlaces = ["A", "B", "C", "D"]
        const newPlaces = [...places];
        //movedPlace = "B"
        //newPlaces.splice(1, 1) → newPlaces = ["A", "C", "D"]
        const [movedPlace] = newPlaces.splice(fromIndex, 1);
        // newPlaces.splice(2, 0, "B") → ["A", "C", "B", "D"]
        newPlaces.splice(toIndex, 0, movedPlace);
        onReorder(day, newPlaces);


    };

    const getTotalDuration = () => {
        return places.reduce((total, place) => total + (place.visitDuration || 60), 0);
    }

    const formatTotalTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
        }
        return `${mins}m`;
    };

    if (places.length === 0){
        return (
            <View style = {styles.emptyContainer}>
                <Ionicons name = "calendar-outline"
                    size= {48}
                    color = {COLORS.gray}
                />
                <Text style={styles.emptyTitle}>
                    No places added yet
                </Text>
                <Text style={styles.emptySubtitle}>
                    Tap on places in the map
                    to add them for {day.replace('day', 'Day ')}
                </Text>

            </View>
        );
    }


    return(
        <View style={styles.container}>
              {/* Day summary */}
             <View style={styles.summaryContainer}>
                    <Text style={styles.summaryText}>
                        {places.length} places • {formatTotalTime(getTotalDuration())} total
                    </Text>

                    <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => setShowMapRoute(true)}
                    >
                    <Ionicons name="map-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.mapButtonText}>View Route</Text>
                    </TouchableOpacity>
             </View>

             {/* Places list */}

            <FlatList
                data={places}
                keyExtractor={(item, index) => `${item.tempId || item.id}_${index}`}
                renderItem={({item, index}) => (
                    <View>
                        <ItineraryItem
                            place={item}
                            index={index}
                            day={day}
                            onDurationchange={handleDurationChange}
                            onRemove={handleRemovePlace}
                            onDragStart={handleDragStart}
                            estimatedTime={estimatedTimes?.[index]}
                        />


                     {/* Move buttons for simple reordering */}
                     <View style={styles.moveButtonsContainer}>
                         {/* as long as indexed variable is not the first element, it can go up */}
                        {index > 0 && (
                            <TouchableOpacity
                                style={styles.moveButton}
                                onPress={() => movePlace(index, 'up')}
                            >
                                 <Ionicons name="arrow-up" size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                        )
                        }
                         {/* as long as indexed varialbe is not the last element, it can go down */}
                          {index < places.length - 1 && (
                            <TouchableOpacity
                            style={styles.moveButton}
                            onPress={() => movePlace(index, 'down')}
                            >
                            <Ionicons name="arrow-down" size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                        )}
                     </View>
                    </View>


                )}
                 showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />

                {/* Map Route Modal */}
                <MapRouteView
                    visible={showMapRoute}
                    onClose={() => setShowMapRoute(false)}
                    places={places}
                    day={day}
                />
        </View>

    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  summaryContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
  listContainer: {
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray,
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  moveButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -15,
    marginBottom: 10,
  },
  moveButton: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 5,
    marginHorizontal: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  mapButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
});


export default DayTab;