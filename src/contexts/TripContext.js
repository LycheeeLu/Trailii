import React, { createContext, useState, useEffect, useReducer, useContext } from 'react';
import FirestoreService  from '../services/fireStoreService';

const TripContext = createContext();

const initialState = {
    currentTrip: null,
    tripId: 'default_trip',// default trip for minimal viable product
    places: [],
    itinerary:{
        day1: [],
        day2: [],
        day3: [],
    },
    loading: false,
    error: null,
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
                itinerary: action.payload.days,
                loading: false
            };
        // ? Firesore subscribe auto update?
        case 'UPDATE_ITINERARY':
            return {
                ...state,
                itinerary: action.payload,
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
/*         case 'SAVE_TO_DAY':
            return {
                ...state,
                itinerary: {
                    ...state.itinerary,
                    [action.day]: [...state.itinerary[action.day], action.place],
                },
            }; */

        // provided by Firestore
/*         case 'REMOVE_FROM_DAY':
            return {
                ...state,
                itinerary: {
                    ...state.itinerary,
                    [action.day]: state.itinerary[action.day].filter(
                        (place) => place.id !== action.placeID

                    ),
                },
            }; */
        default:
            return state;
    }
}

export const TripProvider = ({ children }) => {
    const [state, dispatch]= useReducer(tripReducer, initialState);

    useEffect(() => {
        initializeTrip();
    }, []);

    const initializeTrip = async () => {
        dispatch({type: 'SET_LOADING', payload: true});

        try {
            // try get existing trip or create new one
            let trip;
            try {
                trip = await FirestoreService.getTrip(state.tripId);

            } catch (error) {
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
            dispatch({type: 'SET_ERROR', payload: error.message});
        }
    };

    const addPlace = (place) => {
        dispatch({type: 'ADD_PLACE', payload: place});
    };

    const saveToDay = (place, day) => {
        dispatch({type: 'SAVE_TO_DAY',
                 place, day});
    };

    const removeFromDay = (placeId, day) => {
        dispatch({type: 'REMOVE_FROM_DAY',
                    placeID: placeId,
                     day
        })
    };

    const updateDayItinerary = async(day, places) =>{
        try{
            await FirestoreService.updateDayItinerary(state.currentTrip.id, day, places);

        } catch (error) {
            dispatch({type: 'SET_ERROR', payload: error.message});
        }
    };

    const updatePlaceDuration = async(day, placeIndex, duration) => {
        try {
            await FirestoreService.updatePlaceDuration(state.currentTrip.id, day, placeIndex, duration);
        } catch(error) {
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