import React, { createContext, useState, useEffect, useReducer, useContext, useRef, useMemo, useCallback } from 'react';
import FirestoreService  from '../services/fireStoreService';
import LocalTripStorage from '../services/localTripStorage';
import { buildPlaceData } from '../utils/placeUtils';


const TripContext = createContext();

const STORAGE_MODES = {
    ONLINE: 'online',
    OFFLINE: 'offline',
};

const createEmptyItinerary = () => ({
    day1: [],
    day2: [],
    day3: [],
    day4: [],
    day5: [],
    day6: [],
    day7: []
});

const initialState = {
    currentTrip: null,
    tripId: null,// initial value
    places: [],
    itinerary: createEmptyItinerary(),
    loading: false,
    error: null,
    isInitialized: false,
};

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
                itinerary: action.payload.days || createEmptyItinerary(),
                loading: false,
                error: null,
                isInitialized: true
            };
        // ? Firesore subscribe auto update?
/*         case 'UPDATE_ITINERARY':
            return {
                ...state,
                itinerary: { ...state.itinerary, ...action.payload },
                loading: false
            }; */
        // provided by firestore
        case 'UPDATE_TRIP_FROM_FIRESTORE':
            // only update from Firestore, no local storage
            return {
                ...state,
                currentTrip: action.payload,
                tripId: action.payload?.id || null,
                itinerary: action.payload?.days || state.itinerary,
                loading: false,
                error: null
            };
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
                        && place.tempId !== action.placeID

                    ),
                },
            };

        case 'SET_INITIALIZED':
            return { ...state, isInitialized: true, loading: false };

        case 'MARK_UNINITIALIZED':
            return { ...state, isInitialized: false };

        default:
            return state;
    }
}

export const TripProvider = ({ children }) => {
    const [state, dispatch]= useReducer(tripReducer, initialState);
    const unsubscribeRef = useRef(null);
    const isLocalUpdateRef = useRef(false);
    const [storageModeState, setStorageModeState] = useState(STORAGE_MODES.ONLINE);
    const prevModeRef = useRef(storageModeState);
    const tripIdsRef = useRef({
        [STORAGE_MODES.ONLINE]: null,
        [STORAGE_MODES.OFFLINE]: null,
    });

    const storageServices = useMemo(() => ({
        [STORAGE_MODES.ONLINE]: FirestoreService,
        [STORAGE_MODES.OFFLINE]: LocalTripStorage,
    }), []);

    const storageService = useMemo(
        () => storageServices[storageModeState],
        [storageModeState, storageServices]
    );

    const setStorageMode = useCallback((mode) => {
        setStorageModeState((prev) => (prev === mode ? prev : mode));
    }, []);


    const initializeTrip = useCallback(async (service, mode) => {
        if (!service || !mode) {
            return;
        }
        dispatch({type: 'SET_LOADING', payload: true});

        try {
            // try get existing trip or create new one
            let trip;
            const existingTripId = tripIdsRef.current[mode];
            if (existingTripId){
                try {
                    trip = await service.getTrip(existingTripId);

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
                trip = await service.createTrip('default_user', {
                    name: 'My Traili Trip',
                    destination: 'destination places'

                });
            }
            dispatch({type: 'SET_TRIP', payload: trip});
            tripIdsRef.current = {
                ...tripIdsRef.current,
                [mode]: trip.id,
            };

            // cleaar previous subscription
                if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }

            // subscribe to real-time updates
            if (typeof service.subscribeToTrip === 'function') {
                unsubscribeRef.current = service.subscribeToTrip(trip.id, (updatedTrip) => {
                    console.log('🔔 Storage update received');
                    if (isLocalUpdateRef.current) {
                        console.log('⏭️  Skipping update (local operation)');
                        isLocalUpdateRef.current = false;
                        return;
                    }
                    console.log('📄 Updating from storage');
                    dispatch({type: 'UPDATE_TRIP_FROM_FIRESTORE', payload: updatedTrip});

                });
            } else {
                unsubscribeRef.current = null;
            }
        } catch (error) {
            console.error('Error in initializeTrip:', error);
            dispatch({type: 'SET_ERROR', payload: error.message});
        }
    }, []);

    useEffect(() => {
        if (!storageService) {
            return;
        }
        if (!state.isInitialized && !state.loading){
            initializeTrip(storageService, storageModeState);
        }
    }, [state.isInitialized, state.loading, storageService, storageModeState, initializeTrip]);

    useEffect(() => {
        if (prevModeRef.current !== storageModeState) {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
            dispatch({type: 'MARK_UNINITIALIZED'});
        }
        prevModeRef.current = storageModeState;
    }, [storageModeState]);

    // clear all subscription
        useEffect(() => {
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    const addPlace = (place) => {
        dispatch({type: 'ADD_PLACE', payload: place});
    };

    const saveToDay = async (place, day) => {
        try {
            console.log('💾 Saving place to day:', day, place);
            if (!state.currentTrip?.id) {
                throw new Error('No current trip available');
            }
            if (!storageService) {
                throw new Error('Storage service is not ready');
            }
            const optimisticPlace = {
                ...place,
                tempId: `${place.id || 'place'}_${Date.now()}`,
                visitDuration: place.visitDuration || 60,
                addedAt: new Date().toISOString()
            };

            dispatch({
                type: 'SAVE_TO_DAY',
                day: day,
                place: optimisticPlace
            });

            isLocalUpdateRef.current = true;

            const cleanPlace = buildPlaceData(place);
            const savedPlace = await storageService.addPlaceToDay(state.currentTrip.id, day, cleanPlace);
            console.log('✅ Place saved to Firestore:', savedPlace);

            setTimeout(() => {
                isLocalUpdateRef.current = false;
            }, 1000);

            return savedPlace;
        } catch (error ) {
            console.error('❌ Error saving place to day:', error);
            isLocalUpdateRef.current = false;
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
            if (!storageService) {
                throw new Error('Storage service is not ready');
            }
            const placeToRemove = state.itinerary[day].find(
                place => place.tempId === placeId || place.id === placeId
            );

            if (!placeToRemove) {
                throw new Error('Place not found in itinerary');

            }

           dispatch({
                type: 'REMOVE_FROM_DAY',
                placeID: placeId,
                day: day,
            });

             isLocalUpdateRef.current = true;

            await storageService.removePlaceFromDay(state.currentTrip.id, day, placeToRemove);
            console.log('Place removed from Firestore');

            setTimeout(() => {
                isLocalUpdateRef.current = false;
            }, 1000);



        } catch (error) {
            console.error('Error removing place from day:', error);
            dispatch({type: 'SET_ERROR', payload: error.message});
            throw error;
        }
    };

    const updateDayItinerary = async(day, places) =>{
        try{
            console.log(' Updating day itinerary:', day, places);
            if (!state.currentTrip?.id) {
                throw new Error('No current trip available');
            }
            if (!storageService) {
                throw new Error('Storage service is not ready');
            }

            //upload local data immediately
               dispatch({
                type: 'UPDATE_DAY',
                day: day,
                places: places
            });

             isLocalUpdateRef.current = true;
            await storageService.updateDayItinerary(state.currentTrip.id, day, places);

            setTimeout(() => {
                isLocalUpdateRef.current = false;
            }, 1000);
        } catch (error) {
            dispatch({type: 'SET_ERROR', payload: error.message});
        }
    };

    const updatePlaceDuration = async(day, placeIndex, duration) => {
        try {
            console.log('Updating place duration:', day, placeIndex, duration);
            if (!state.currentTrip?.id) {
                throw new Error('No current trip available');
            }
            if (!storageService) {
                throw new Error('Storage service is not ready');
            }
             isLocalUpdateRef.current = true;
            await storageService.updatePlaceDuration(state.currentTrip.id, day, placeIndex, duration);
            const updatedTrip = await storageService.getTrip(state.currentTrip.id);
            dispatch({type: 'SET_TRIP', payload: updatedTrip});
                setTimeout(() => {
                isLocalUpdateRef.current = false;
            }, 1000);
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
        storageMode: storageModeState,
        storageModes: STORAGE_MODES,
        setStorageMode,

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
