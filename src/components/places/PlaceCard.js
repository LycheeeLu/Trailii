import {useState, useEffect, use} from 'react';
import {View, Text, StyleSheet, Image, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTrip } from '../../contexts/TripContext';
import googlePlacesService from '../../services/googlePlacesService';
import { COLORS, SIZES } from '../../constants/config';
import { Linking, Touchable, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native';


const PlaceCard = ({place, onClose, visible}) => {
    const [activeTab, setActiveTab] = useState('main');
    const [placeDetails, setPlaceDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const { saveToDay, itinerary } = useTrip();


    useEffect(() => {
        if (visible && place) {
            loadPlaceDetails();
        }
    }, [visible, place]);


    const loadPlaceDetails = async () => {
        setLoading(true);
        try {
          // raw data from API
            const details = await googlePlacesService.getPlaceDetails(place.id);
            // formatted data
            const formattedPlace = googlePlacesService.formatPlaceDetails(details);
            console.log('=== Debug formatted place ===');
            console.log('Formatted place:', formattedPlace);
            console.log('Phone number:', formattedPlace.phoneNumber);
            console.log('Opening hours:', formattedPlace.openingHours);
            console.log('=============================');
            setPlaceDetails(formattedPlace);

        } catch (error) {
            console.error('Place Card Error fetching place details:', error);
            setPlaceDetails(place); // Fallback to basic place info

        } finally{
            setLoading(false);
        }
    };

    const handleSaveToDay = (day) => {
        const placeToSave = {
            ...place,
            ...placeDetails,
            visitDuration: 60, // default duration 1 hour
            addedAt: new Date().toISOString(),
        };
        saveToDay(placeToSave, day);
        Alert.alert('Saved', `${place.name} (place) added to  ${day.replace('day', 'Day ')}`);
        // display "Day 1" instead of "day1"

    };

    const openWebsite = () => {
        if (placeDetails?.website){
            Linking.openURL(placeDetails.website);
        }
    };

    const getPhotoUrl = (photoRef) => {
        return googlePlacesService.getPhotoUrl(photoRef.photo_reference, 400);
    };

    if (!visible || !place) return null;

    const displayPlace = placeDetails || place;


    return(
        <View style = {styles.overlay}>
            <View style = {styles.card}>

                {/* Header */}
                <View style = {styles.header}>
                    <Text style = {styles.title}>{place.name}</Text>
                    <TouchableOpacity onPress = {onClose}
                    style = {styles.closeButton}>
                        <Ionicons name = "close" size = {24} color = {COLORS.gray}/>
                    </TouchableOpacity>
                </View>

                {/* Tab Navigation */}
                <View style = {styles.tabContainer}>
                    <TouchableOpacity
                        style = {[styles.tab, activeTab === 'main' && styles.activeTab ]}
                        onPress = {() => setActiveTab('main')}>
                        <Text style = {[styles.tabText, activeTab === 'main'&& styles.activeTabText]}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style = {[styles.tab, activeTab === 'details' && styles.activeTab ]}
                        onPress = {() => setActiveTab('details')}>
                        <Text style = {[styles.tabText, activeTab === 'details'&& styles.activeTabText]}>Details</Text>
                    </TouchableOpacity>

                        <TouchableOpacity
                        style = {[styles.tab, activeTab === 'photos' && styles.activeTab ]}
                        onPress = {() => setActiveTab('photos')}>
                        <Text style = {[styles.tabText, activeTab === 'photos'&& styles.activeTabText]}>Photos</Text>
                    </TouchableOpacity>
                </View>


                  {/* Tab content */}
                  <ScrollView style = {styles.content}>
                        {activeTab === 'main' && (
                        <View style = {styles.mainTab}>

                            <Text style = {styles.sectionTitle}>Add to itinerary: </Text>
                            <View style = {styles.dayButtons}>
                                {['day1', 'day2', 'day3'].map((day) => (
                                    <TouchableOpacity
                                        key = {day}
                                        style = {styles.dayButton}
                                        onPress = {() => handleSaveToDay(day)}
                                    >
                                        <Ionicons name = "add-circle" size = {20} color = {COLORS.primary}/>
                                        {/* itinerary = {
                                            day1: [spotA, spotB],
                                            day2: [spotC],
                                            day3: []
                                            } */}
                                        {/* itinerary['day1'] -> 2 places to visit in day 1 */}
                                        <Text style = {styles.dayButtonText}>
                                            {day.replace('day', 'Day ')} ({itinerary[day]?.length || 0})
                                            </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>


                        </View>
                        )}

                        {activeTab === 'details' && (
                            <View style = {styles.detailsTab}>
                           {displayPlace.rating && (
                                <View style = {styles.quickInfo}>
                                    <View style = {styles.ratingContainer}>
                                        <Ionicons name = "star" size = {16} color = {COLORS.warning}/>
                                        <Text style = {styles.rating}>{displayPlace.rating}</Text>
                                    </View>

                                    {displayPlace.isOpen !== undefined && (
                                        <Text style = {[styles.openStatus, {color: displayPlace.isOpen ? COLORS.success : COLORS.danger}]}>
                                            {displayPlace.isOpen ? 'Open Now' : 'Closed'}
                                        </Text>
                                    )}
                                </View>
                            )}

                                {loading ? (
                                    <Text>Loading details...</Text>
                                ) : (
                                    <>
                                        <View style={styles.detailItem}>
                                          <Ionicons name="location-sharp" size={18} color={COLORS.primary} />
                                          <Text style={styles.address}>{displayPlace.address}</Text>
                                        </View>

                                          {displayPlace.website && (
                                            <TouchableOpacity style= { styles.detailItem} onPress = {openWebsite}>
                                                <Ionicons name = "globe" size = {16} color = {COLORS.primary}/>
                                                <Text style = {[styles.detailText, styles.link]}>{displayPlace.website}</Text>
                                            </TouchableOpacity>
                                        )}

                                        {displayPlace.openingHours && (
                                            <View style = {styles.detailItem}>
                                                <Ionicons name = "time" size = {16} color = {COLORS.primary}/>
                                                <View style = {styles.hoursContainer}>
                                                    <Text style = {styles.detailText} >Opening Hours:</Text>
                                                    {displayPlace.openingHours.weekday_text && displayPlace.openingHours.weekday_text.length > 0 ? (
                                                        displayPlace.openingHours.weekday_text.map((hour, index) => (
                                                            <Text key = {index} style = {styles.detailText}>
                                                                {hour}
                                                            </Text>
                                                    ) )

                                            ): (<Text style = {styles.detailText}>No opening hours available.</Text>)}
                                                </View>
                                            </View>
                                        )}

                                           {displayPlace.phoneNumber && (
                                            <TouchableOpacity style={styles.detailItem}>
                                                <Ionicons name="call" size={16} color={COLORS.primary} />
                                                <Text style = {styles.detailText}>{displayPlace.phoneNumber}</Text>
                                            </TouchableOpacity>
                                        )}

                                    </>
                                    )}
                            </View>
                        )}

                        {activeTab === 'photos' && (
                            <View style={styles.photosTab}>
                                {displayPlace.photo && displayPlace.photos.length > 0 ? (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {displayPlace.photos.slice(0,5).map((photo, index) => (
                                            <Image
                                                key={index}
                                                source={{ uri: getPhotoUrl(photo) }}
                                                style={styles.photo}
                                            />
                                        ))}
                                    </ScrollView>
                                ) : (
                                    <Text>No photos available.</Text>
                                )}
                            </View>
                        )}
                  </ScrollView>
            </View>
        </View>

    );
};



const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  mainTab: {

  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 15,
  },
  dayButtons: {
    marginBottom: 20,
  },
  dayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    marginBottom: 10,
  },
  dayButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 10,
    fontWeight: '500',
  },
  quickInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 5,
    fontWeight: '500',
  },
  openStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsTab: {

  },
  address: {
    fontSize: 16,
    color: COLORS.gray,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  detailText: {
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 10,
    flex: 1,
  },
  link: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  hoursContainer: {
    marginLeft: 10,
    flex: 1,
  },
  hoursText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  photosTab: {

  },
  photo: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginRight: 10,
  },
  noPhotos: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 16,
    marginTop: 50,
  },
});

export default PlaceCard;