import React, { useState, useEffect } from "react";
import {View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/config";
import { useTrip } from "../contexts/TripContext";
import { ScrollView } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import DayTab from "../components/itinerary/DayTab";
import OptimizationResults from "../components/itinerary/OptimizationResults";
import routeOptimizer from "../services/routeOptimizer";


const DAYS = [
  {key: 'day1', label: 'Day 1'},
  {key: 'day2', label: 'Day 2'},
  {key: 'day3', label: 'Day 3'},
  {key: 'day4', label: 'Day 4'},
  {key: 'day5', label: 'Day 5'},
  {key: 'day6', label: 'Day 6'},
  {key: 'day7', label: 'Day 7'},
]


const ItineraryScreen = () =>{

  const [activeDay, setActiveDay] = React.useState('day1');
  const {itinerary, updateDayItinerary, loading, currentTrip} = useTrip();


  const handleReorder = (day, newPlaces) => {
    updateDayItinerary(day, newPlaces);
  };

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
    return `${displayHrs}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatDuration = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs} hr ${mins} min`;
    }
    return `${mins} min`;
  };

  const resolveDisplayTime = (timeValue) => {
    if (timeValue === null || timeValue === undefined) {
      return null;
    }
    return typeof timeValue === 'number' ? formatTime(timeValue) : timeValue;
  };

  const getPlaceStartTime = (place) => {
    if (!place) return null;
    return resolveDisplayTime(
      place.scheduledStartTime ||
      place.arrivalTime ||
      place.estimatedArrival ||
      place.scheduledArrivalMinutes
    );
  };

  const getPlaceEndTime = (place) => {
    if (!place) return null;
    return resolveDisplayTime(
      place.scheduledEndTime ||
      place.departureTime ||
      place.estimatedDeparture ||
      place.scheduledDepartureMinutes
    );
  };

  //simple mock time estimation
  const getEstimatedTimes = (places) => {
    let currentTime = 10 * 60; // start at 10:00 AM in minutes
    return places.map((place, index) => {
      const arrivalTime = currentTime;
      const departureTime = currentTime + (place.visitDuration || 60);

      // assume 1 hour per place
      //assume 30 mins travel time between places

       // Add travel time to next place (except for last place)
      if (index < places.length - 1) {
        currentTime = departureTime + 30;
      } else {
        currentTime = departureTime;
      }

      return {
        arrival: formatTime(arrivalTime),
        departure: formatTime(departureTime),
      }
    })
  }

  const getDayInfo = (dayKey) => {
    const dayPlaces = itinerary[dayKey] || [];

        console.log("do i have day places"+ dayPlaces);
    const dayDuration = dayPlaces.reduce((sum, place) => sum + (place.visitDuration || 60), 0);


    const hasScheduledTimes = dayPlaces.some(place => getPlaceStartTime(place) && getPlaceEndTime(place));
    console.log("do i have scheduleTimes"+ hasScheduledTimes);
    let startTime = null;
    let endTime = null;
    let estimatedTimes = [];

    if (hasScheduledTimes){
      const firstScheduledPlace = dayPlaces.find(place => getPlaceStartTime(place));
      const lastScheduledPlace = [...dayPlaces].reverse().find(place => getPlaceEndTime(place));
      startTime = getPlaceStartTime(firstScheduledPlace);
      endTime = getPlaceEndTime(lastScheduledPlace);

      estimatedTimes = dayPlaces.map(place => ({
        arrival: getPlaceStartTime(place),
        departure: getPlaceEndTime(place),
      }));
    } else {
      // fall back to mock
      estimatedTimes = getEstimatedTimes(dayPlaces);
    startTime = estimatedTimes.length > 0 ? estimatedTimes[0].arrival : null;
    endTime = estimatedTimes.length > 0 ? estimatedTimes[estimatedTimes.length - 1].departure : null;
    }

    return {
      places: dayPlaces,
      duration: dayDuration,
      count: dayPlaces.length,
      startTime,
      endTime,
      estimatedTimes,
      isOptimized: hasScheduledTimes,

    };
  };

  // { totalPlaces: 3, totalDuration: 270 }
  /* const itinerary = {
  day1: [
    { name: "museum", visitDuration: 90 },
    { name: "park" } // no specified visitDuration，default 60
  ],
  day2: [
    { name: "fish soup", visitDuration: 120 }
  ]
};
  */
 const getTripSummary = () => {
  const totalPlaces = Object.values(itinerary).reduce((sum, dayPlaces) => sum + dayPlaces.length, 0);
  const totalDuration = Object.values(itinerary).reduce((sum, dayPlaces) => {
    return sum + dayPlaces.reduce((daySum, place) => daySum + (place.visitDuration || 60), 0);
  }, 0);

  return { totalPlaces, totalDuration };
 };

 const { totalPlaces, totalDuration } = getTripSummary();

 if (loading && !currentTrip){
  return (
    <View style={styles.loadingContainer}>
      <Text>Loading itinerary...</Text>
    </View>
  );
 }

    return(
      <SafeAreaProvider style={styles.container}>
             {/* Trip Header */}
              <View style={styles.header}>
                <Text style={styles.tripTitle}>
                     <Ionicons name="location" size={24} color={COLORS.primary} />
                      {currentTrip ? currentTrip.name : 'My Trip'} : {totalPlaces} Places
                </Text>

              </View>

              <View style={{flex: 1, flexDirection: "row"}}>
                   {/* Day Tabs on the Left */}
                  <View style={styles.tabsContainer}>
                  {/*vertical*/}
                    <ScrollView
                      contentContainerStyle={
                        styles.tabsContent}
                    >
                      {DAYS.map((day) => {
                        const dayInfo = getDayInfo(day.key);
                        const isActive = activeDay === day.key;
                        return(
                          <TouchableOpacity
                          key={day.key}
                          style={[
                            styles.tab,
                            isActive && styles.activeDayTab,
                          ]}
                          onPress={() => setActiveDay(day.key)}>

                            <Text
                              style={[
                                styles.dayTabText,
                                isActive && styles.activeDayTabText,

                              ]}
                            >
                            {day.label}
                            </Text>

                            <View style={styles.dayTabMeta}>
                              <Text style={[
                                styles.dayTabCount,
                                isActive && styles.activeDayTabCount
                              ]}>
                                {dayInfo.count} places
                              </Text>

{/*                               {dayInfo.duration > 0 && (
                                <Text style={[
                                  styles.dayTabDuration,
                                  isActive && styles.activeDayTabDuration
                                ]}>
                                  {formatDuration(dayInfo.duration)}
                                </Text>
                              )} */}

                              {dayInfo.startTime && dayInfo.endTime && (
                                <Text style={[
                                  styles.dayTabTime,
                                  isActive && styles.activeDayTabTime
                                ]}>
                                  {dayInfo.startTime} - {dayInfo.endTime}

                                </Text>

                              )}
                            </View>

                             {/* Active indicator */}
                             {isActive && <View style={styles.activeIndicator} />}
                            </TouchableOpacity>

                        );
                      })}
                    </ScrollView>
                    </View>

                    {/* Active Day Content on the right */}
                    <View style={styles.contentContainer}>
                      <DayTab
                        day={activeDay}
                        places={itinerary[activeDay] || []}
                        onReorder={handleReorder}
                        estimatedTimes={getDayInfo(activeDay).estimatedTimes}
                        isOptimized={getDayInfo(activeDay).isOptimized}
                      />
                    </View>


{/*
                <OptimizationResults
                  visible={showOptimizationResults}
                  onClose={() => setShowOptimizationResults(false)}
                  results={optimizationResults}
                  onApply={handleApplyOptimization}
                />
 */}

                </View>

                     {/* Quick Add Button */}
{/*                       <TouchableOpacity style={styles.quickAddButton}>
                      <Ionicons name="add-circle" size={24} color={COLORS.white} />
                        <Text style={styles.quickAddText}>SPOT</Text>
                     </TouchableOpacity> */}

      </SafeAreaProvider>

    );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  tripSummary: {
    fontSize: 14,
    color: COLORS.primaryDark + 'CC',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatLabel: {
    fontSize: 12,
    color: COLORS.black + 'AA',
    marginBottom: 2,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  tabsContainer: {
    width: 80,
    alignSelf: "flex-start",
    backgroundColor: COLORS.surface,
  },
  tabsContent: {
    flexGrow: 1,
    paddingHorizontal: 10,
    justifyContent: "space-around",
  },
  dayTab: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 60,
    position: 'relative',
  },
  activeDayTab: {
    backgroundColor: COLORS.background,
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  activeDayTabText: {
    color: COLORS.white,
  },
 dayTabMeta: {
    flexDirection: "column",
    alignItems: 'flex-start',
    marginTop: 4
  },
  dayTabCount: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
    marginBottom: 2
  },
  activeDayTabCount: {
    color: COLORS.white + 'CC',
  },
  dayTabDuration: {
    fontSize: 10,
    color: COLORS.gray,
    fontWeight: '500',
    marginBottom: 2,
  },
  activeDayTabDuration: {
    color: COLORS.white + 'AA',
  },
  dayTabTime: {
    fontSize: 9,
    color: COLORS.gray,
    fontWeight: '400',
  },
  activeDayTabTime: {
    color: COLORS.white + '99',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.background,
    borderRadius: 1.5,
  },
  contentContainer: {
    flex: 1,
    borderColor: '#ccc',
    borderLeftWidth: 1,
  },
/*    quickAddButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
   quickAddText: {
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: 8,
  }, */
});

export default ItineraryScreen;
