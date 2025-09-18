import { Ionicons } from "@expo/vector-icons";
import React, {useState} from "react";
import { TouchableOpacity } from "react-native";
import { COLORS } from "../../constants/config";
import GooglePlacesService from "../../services/googlePlacesService";
import { View, Text, TextInput, FlatList, ActivityIndicator, StyleSheet } from "react-native";

const SearchBar = ({onPlaceSelect, currentLocation}) => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleSearch = async (searchQuery) => {
        if (searchQuery.length < 3) {
            selfetResult([]);
            setShowResults(false);
            return;
        }

        setLoading(true);
        try {
            const places = await GooglePlacesService.searchByText(
                searchQuery,
                currentLocation.latitude,
                currentLocation.longitude
            );
            setResult(places);
            setShowResults(true);

        } catch (error) {
            console.error('Search error:', error);
            setResult([]);
        } finally {
            setLoading(false);

        }

    };

    const handlePlacePress = (place) => {
        setQuery(place.name);
        setShowResults(false);
        onPlaceSelect(place);
    };

    const clearSearch = () => {
        setQuery('');
        setResult([]);
        setShowResults(false);
    };


    const renderPlaceItem = ({item}) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress = {() => handlePlacePress(item)}
            >
            <View style ={styles.resultInfo}>
                <Text style = {styles.placeName}>{item.name}</Text>
                <Text style = {styles.placeAddress}>{item.address}</Text>
            </View>
            </TouchableOpacity>
    );


    return (
        <View style={styles.container}>
            <View style = {styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon}/>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search places..."
                    value={query}
                    onChangeText={(text) => {
                        setQuery(text);
                        handleSearch(text);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {loading && <ActivityIndicator size="small" color={COLORS.primary} />}
                {query.length > 0 && !loading && (
                    <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
                        <Ionicons name="close-circle" size={20} color={COLORS.gray} />
                    </TouchableOpacity>
                )}
            </View>

            {showResults && result.length > 0 && (
                <FlatList
                    data={result}
                    renderItem={renderPlaceItem}
                    keyExtractor={(item) => item.id}
                    style={styles.resultsList}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );

};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 40,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    clearButton: {
        marginLeft: 10,
    },
    resultsList: {
        backgroundColor: COLORS.background,
        borderRadius: 8,
        marginTop: 10,
        maxHeight: 200,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    resultItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    resultInfo: {
        flex:1,
    },
    placeName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    placeAddress: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
});

export default SearchBar;