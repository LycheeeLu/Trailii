import React, { createContext, useState, useEffect, useReducer, useContext } from 'react';
import FirestoreService  from '../services/fireStoreService';

const TripContext = createContext();

const initialState = {
    currentTrip: null,
    tripId: null,// initial value
    places: [],
    itinerary:{
        day1: [],
        day2: [],
        day3: [],
        day4: [],
        day5: [],
        day6: [],
        day7: []

    },
    loading: false,
    error: null,
    isInitialized: false,
}

const tripReducer = (state, action) => {
    switch(action.type){
        case 'SET_LOADING':
            return{ ...state, loading: action.payload };
        case 'SET_ERROR':
            return{ ...state, error: action.payload, loading: false };
        case 'SET_TRIP':
            return {
                ...state,
                currentTrip: action.payload,
                tripId: action.payload?.id || null,
                itinerary: action.payload.days,
                loading: false,
                error: null,
                isInitialized: true
            };
        // ? Firesore subscribe auto update?
        case 'UPDATE_ITINERARY':
            return {
                ...state,
                itinerary: { ...state.itinerary, ...action.payload },
                loading: false
            };
        // provided by firestore
        case 'UPDATE_DAY':
            return {
                ...state,
                itinerary: {
                    ...state.itinerary,
                    [action.day]: action.places
                },
            };
        // places is included in itinerary
        // no need for this standalone state case?????
         case 'ADD_PlACE':
            return{ ...state, places: [...state.places, action.payload]};

        // provided by Firestore
        case 'SAVE_TO_DAY':
            console.log('💾 SAVE_TO_DAY action:', action.day, action.place);
            return {
                ...state,
                itinerary: {
                    ...state.itinerary,
                    [action.day]: [...state.itinerary[action.day], action.place],
                },
            };

        // provided by Firestore
        case 'REMOVE_FROM_DAY':
            console.log('🗑️ REMOVE_FROM_DAY action:', action.day, action.placeID);
            return {
                ...state,
                itinerary: {
                    ...state.itinerary,
                    [action.day]: state.itinerary[action.day].filter(
                        (place) => place.id !== action.placeID

                    ),
                },
            };

        case 'SET_INITIALIZED':
        return { ...state, isInitialized: true, loading: false };


        default:
            return state;
    }
}

export const TripProvider = ({ children }) => {
    const [state, dispatch]= useReducer(tripReducer, initialState);

    useEffect(() => {
        if (!state.isInitialized){
         initializeTrip();
        }

    }, [state.isInitialized]);

    const initializeTrip = async () => {
        dispatch({type: 'SET_LOADING', payload: true});

        try {
            // try get existing trip or create new one
            let trip;
            if (state.tripId && state.tripId !== null){
                try {
                trip = await FirestoreService.getTrip(state.tripId);

                } catch (error) {
                console.error('Full error object:', error);
                console.error('Error stack:', error.stack);
                console.error('Error message:', error.message);

                console.log('Trip not found, creating new one...');
                trip = null;
                }
            }

            if (!trip){
                console.log('Creating new default trip...');
                // create default trip it it doesnt exist
                trip = await FirestoreService.createTrip('default_user', {
                    name: 'My Traili Trip',
                    destination: 'destination places'

                });
            }
            dispatch({type: 'SET_TRIP', payload: trip});
            // subscribe to real-time updates
            FirestoreService.subscribeToTrip(trip.id, (updatedTrip) => {
                dispatch({type: 'SET_TRIP', payload: updatedTrip});

            });
        } catch (error) {
            console.error('Error in initializeTrip:', error);
            dispatch({type: 'SET_ERROR', payload: error.message});
        }
    };

    const addPlace = (place) => {
        dispatch({type: 'ADD_PLACE', payload: place});
    };

    const saveToDay = async (place, day) => {
        try {
            console.log('💾 Saving place to day:', day, place);
            if (!state.currentTrip?.id) {
                throw new Error('No current trip available');
            }
            const savedPlace = await FirestoreService.addPlaceToDay(state.currentTrip.id, day, place);
            console.log('✅ Place saved to Firestore:', savedPlace);
            dispatch({type: 'SAVE_TO_DAY',
                    place: savedPlace,
                    day: day});

            return savedPlace;
        } catch (error ) {
            console.error('❌ Error saving place to day:', error);
            dispatch({type: 'SET_ERROR', payload: error.message});
            throw error;
        }
    };

    const removeFromDay = async (placeId, day) => {
        try {
            console.log('Removing place from day:', day, placeId);

            if(!state.currentTrip?.id){
                throw new Error('No current trip available');
            }
            const placeToRemove = state.itinerary[day].find(
                place => place.tempId === placeId || place.id === placeId
            );

            if (!placeToRemove) {
                throw new Error('Place not found in itinerary');

            }

            await FirestoreService.removePlaceFromDay(state.currentTrip.id, day, placeToRemove);
            console.log('Place removed from Firestore');

            dispatch({
                type: 'REMOVE_FROM_DAY',
                placeID: placeId,
                day: day,
            });
        } catch (error) {
            console.error('Error removing place from day:', error);
            dispatch({type: 'SET_ERROR', payload: error.message});
            throw error;
        }
    };

    const updateDayItinerary = async(day, places) =>{
        try{
            console.log(' Updating day itinerary:', day, places);
            await FirestoreService.updateDayItinerary(state.currentTrip.id, day, places);

            //upload local data immediately
               dispatch({
                type: 'UPDATE_DAY',
                day: day,
                places: places
            });

        } catch (error) {
            dispatch({type: 'SET_ERROR', payload: error.message});
        }
    };

    const updatePlaceDuration = async(day, placeIndex, duration) => {
        try {
            console.log('Updating place duration:', day, placeIndex, duration);
            await FirestoreService.updatePlaceDuration(state.currentTrip.id, day, placeIndex, duration);
            const updatedTrip = await FirestoreService.getTrip(state.currentTrip.id);
            dispatch({type: 'SET_TRIP', payload: updatedTrip});
        } catch(error) {
            console.error('Error updating place duration:', error);
            dispatch({type: 'SET_ERROR', payload: error.message});
        }
    };

    const value = {
        ...state,
        addPlace,
        saveToDay,
        removeFromDay,
        updateDayItinerary,
        updatePlaceDuration,

    };

    return (
        <TripContext.Provider value={value}>
            {children}
        </TripContext.Provider>
    );
};


export const useTrip = () => {
    const context = useContext(TripContext);
    if (! context) {
        throw new Error('useTrip must be used within a TripProvider');
    }
    return context;
};