import React, { useState, useEffect } from "react";
import {View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS } from "../constants/config";
import { useTrip } from "../contexts/TripContext";
import { ScrollView } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';



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

  //simple mock time estimation
  const getEstimatedTimes = (places) => {
    let currentTime = 10 * 60; // start at 10:00 AM in minutes
    return places.map((place) => {
      const arrivalTime = currentTime;
      const departureTime = currentTime + (place.visitDuration || 60);
      currentTime = departureTime + 30;
      // assume 1 hour per place
      //assume 30 mins travel time between places

      return {
        arrival: formatTime(arrivalTime),
        departure: formatTime(departureTime),
      }
    })
  }

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
                  {currentTrip ? currentTrip.name : 'My Trip'}
                </Text>
                <Text style = {styles.getTripSummary}>
                  {totalPlaces} places · {formatDuration(totalDuration)} total
                </Text>
              </View>

                   {/* Day Tabs */}
                  <View style={styles.tabsContainer}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.tabsContent}
                    >
                      {DAYS.map((day) => (
                        <TouchableOpacity
                          key={day.key}
                          style={[
                            styles.tab,
                            activeDay === day.key && styles.activeTab,
                          ]}
                          onPress={() => setActiveDay(day.key)}
                        >
                          <Text
                            style={[
                              styles.tabText,
                              activeDay === day.key && styles.activeTabText,
                            ]}
                          >
                            {day.label}
                          </Text>
                          <Text style={[styles.dayTabCount,
                            activeDay === day.key && styles.activeDayTabCount
                          ]}>
                              {itinerary[day.key]?.length || 0} places
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    </View>

                    {/* Active Day Content */}
                    <View style={styles.contentContainer}>
                      <Text>imagine here is daytab</Text>
                    </View>

                     {/* Quick Add Button */}
                     <TouchableOpacity style={styles.quickAddButton}>
                      <Ionicons name="add-circle" size={24} color={COLORS.white} />
                        <Text style={styles.quickAddText}> Quick Add</Text>
                     </TouchableOpacity>
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
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  tripSummary: {
    fontSize: 14,
    color: COLORS.white + 'CC',
  },
  tabsContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tabsContent: {
    paddingHorizontal: 10,
  },
  dayTab: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    minWidth: 80,
  },
  activeDayTab: {
    backgroundColor: COLORS.primary,
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  activeDayTabText: {
    color: COLORS.white,
  },
  dayTabCount: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  activeDayTabCount: {
    color: COLORS.white + 'CC',
  },
  contentContainer: {
    flex: 1,
  },
  quickAddButton: {
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
  },
});

export default ItineraryScreen;