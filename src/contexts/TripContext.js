import React, { createContext, useState, useEffect, useReducer, useContext } from 'react';

const TripContext = createContext();

const initialState = {
    currentTrip: null,
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
        case 'Add_PlACE':
            return{ ...state, places: [...state.places, action.payload]};
        case 'SAVE_TO_DAY':
            return {
                ...state,
                itinerary: {
                    ...state.itinerary,
                    [action.day]: [...state.itinerary[action.day], action.place],
                },
            };
        case 'REMOVE_FROM_DAY':
            return {
                ...state,
                itinerary: {
                    ...state.itinerary,
                    [action.day]: state.itinerary[action.day].filter(
                        (place) => place.id !== action.placeID

                    ),
                },
            };
        default:
            return state;
    }
}

export const TripProvider = ({ children }) => {
    const [state, dispatch]= useReducer(tripReducer, initialState);

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
    }

    const value = {
        ...state,
        addPlace,
        saveToDay,
        removeFromDay
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
}