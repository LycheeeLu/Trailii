import React, {useState} from "react";
import {COLORS} from "../../constants/config";
import { useTrip } from "../../contexts/TripContext";
import ItineraryItem from "./ItineraryItem";
import MapRouteView from "./MapRouteView";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, TouchableOpacity, StyleSheet, View, Text, ActivityIndicator, Alert } from "react-native";
import RouteOptimizer from "../../services/routeOptimizer";
import OptimizationResults from "./OptimizationResults";
import ScheduleOptions from '../itinerary/ScheduleOptions';

const DayTab = ({day, places, onReorder, estimatedTimes}) => {
    const [showMapRoute, setShowMapRoute] = useState(false);
    const [showScheduleOptions, setShowScheduleOptions] = useState(false);
    const [showOptimizationResults, setShowOptimizationResults] = useState(false);
    const [optimizationResults, setOptimizationResults] = useState(null);
    const [optimizing, setOptimizing] = useState(false);
    const [showCurrentSchedule, setShowCurrentSchedule] = useState(false);


    const {removeFromDay, updatePlaceDuration, updateDayItinerary} = useTrip();

    const handleRemovePlace = (place) => {
      Alert.alert(
        'Remove Place',
      `Remove ${place.name} from your itinerary?`,
      [
        {text: 'Cancel', style: 'cancel'},
        { text: 'Remove', style: 'destructive', onPress: () => removeFromDay(place.tempId?? place.id, day)}
      ]
      );
    };

    const handleDurationChange = (placeIndex, duration) =>{
        updatePlaceDuration(day, placeIndex, duration);
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

    const handleOptimizeSchedule = async (options) => {
      if (places.length < 2) {
        Alert.alert('Info', 'Add at least 2 places to optimize the route');
        return;
      }

      setOptimizing(true);
      console.log('🚀 Starting route optimization...');

      try {
        const optimizedResult = await RouteOptimizer.optimizeRoute(places, {
          ...options,
          considerOpeningHours: true,
          maxIterations: 100
        });

        console.log('✅ Optimization complete:', optimizedResult);

        setOptimizationResults(optimizedResult);
        setShowOptimizationResults(true);

      } catch (error) {
        console.error('❌ Optimization error:', error);
        Alert.alert(
          'Optimization Failed',
          'Could not optimize route. Please try again or check your internet connection.'
        );
      } finally {
        setOptimizing(false);
      }
    };

 const handleApplyOptimization = async (results) => {
  try {
    const placesWithSchedule = results.optimizedPlaces.map((place) => ({
      ...place,
      scheduledStartTime: place.arrivalTime,
      scheduledEndTime: place.departureTime,
      scheduledArrivalMinutes: place.scheduledArrival,
      scheduledDepartureMinutes: place.scheduledDeparture,
      // ensure the time strings exist for screens that expect them
      estimatedArrival: place.arrivalTime,
      travelFromPrevious: place.travelFromPrevious,
    }));

    await updateDayItinerary(day, placesWithSchedule);

    Alert.alert('Success', 'Route has been optimized and saved!');
    setShowOptimizationResults(false);
  } catch (error) {
    Alert.alert('Error', 'Failed to save optimized route. Please try again.');
    console.error('Failed to save optimization:', error);
  }
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
                   <View style={styles.summaryLeft}>
                      {optimizing && (
                        <View style={styles.optimizingBadge}>
                          <ActivityIndicator size="small" color={COLORS.primary} />
                          <Text style={styles.optimizingText}>Optimizing...</Text>
                        </View>
                      )}
                    </View>

                  <View style={styles.summaryRight}>
                    <TouchableOpacity
                      style={[styles.actionButton, optimizing && styles.disabledButton]}
                      onPress={() => setShowScheduleOptions(true)}
                      disabled={optimizing}
                    >
                      <Ionicons
                        name={optimizing ? "hourglass-outline" : "flash-outline"}
                        size={14}
                        color={optimizing ? COLORS.gray : COLORS.primary}
                      />
                      <Text style={[styles.actionButtonText, optimizing && styles.disabledText]}>
                        Optimize
                      </Text>
                    </TouchableOpacity>


                    <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => setShowMapRoute(true)}
                    >
                    <Ionicons name="map-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.mapButtonText}> View Daily Route</Text>
                    </TouchableOpacity>
                  </View>
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
                            isLast={index === places.length - 1}
                            onMoveUp={index > 0 ? () => movePlace(index, 'up') : undefined}
                            onMoveDown={index < places.length - 1 ? () => movePlace(index, 'down') : undefined}
                        />

                        {/* Travel info to next place - similar to OptimizationResults */}
                        {index < places.length - 1 && (
                            <View style={styles.travelInfoContainer}>
                                <View style={styles.travelContent}>
                                    <Ionicons name="walk" size={16} color={COLORS.gray} />
                                    {item.travelFromPrevious || places[index + 1].travelFromPrevious ? (
                                        <Text style={styles.travelText}>
                                            {places[index + 1].travelFromPrevious?.durationText || '~15 min'} • {places[index + 1].travelFromPrevious?.distanceText || '~1 km'}
                                        </Text>
                                    ) : (
                                        <Text style={styles.travelText}>
                                           optimize to view travel time
                                        </Text>
                                    )}
                                </View>
                            </View>
                        )}

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

                  <ScheduleOptions
                  visible={showScheduleOptions}
                  onClose={() => setShowScheduleOptions(false)}
                  onOptimize={handleOptimizeSchedule}
                />

                <OptimizationResults
                  visible={showOptimizationResults}
                  onClose={() => setShowOptimizationResults(false)}
                  results={optimizationResults}
                  onApply={handleApplyOptimization}
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
  travelInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 35,
    paddingLeft: 20,
    paddingVertical: 12,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.primary + '30',
  },
  travelContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  travelText: {
    marginLeft: 8,
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: '500',
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
    summaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
    summaryLeft: {
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray + '80',
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  disabledText: {
    color: COLORS.gray,
  },
});


export default DayTab;
