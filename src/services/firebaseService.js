import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore,
        Timestamp,
        onSnapshot,
        setDoc,
        getDoc,
        collection,
        updateDoc,
        deleteDoc,
        arrayUnion,
        arrayRemove
 } from "firebase/firestore";
import { FIREBASE_CONFIG } from "../constants/config";
import { db } from './firebaseService';
import { getCurrentTimestamp } from "react-native/types_generated/Libraries/Utilities/createPerformanceLogger";

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

class FireStoreService {
    constructor(){
        this.tripsCollection = 'trips';
        this.usersCollection = 'users';
    }

    // create a new trip
    async createTrip(userId, tripData){
        try{
            const tripId = `trip_${Date.now()}_${userId}`;
            const trip = {
                id: tripId,
                userId,
                name: tripData.name || 'My Trip',
                destination: tripData.destination || '',
                startDate: tripData.startDate || new Date().toISOString(),
                endDate: tripData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                days: {
                    day1: [],
                    day2: [],
                    day3: [],
                    day4: [],
                    day5: [],
                    day6: [],
                    day7: []
                },
                createdAt: Timestamp.now(),
                //        createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };
            await setDoc(doc(db, this.tripsCollection, tripId), trip);
            return trip;
        } catch (error) {
            console.error ('Firebase Service Error creating trip:', error);
            throw error;
        }
    }

    // get trip by ID
    async getTrip(tripId) {
        try{
            const docRef = doc(db, this.tripsCollection, tripId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()){
                return docSnap.data();
            } else {
                throw new Error ('Firebase Service getTrip(): trip not found');
            }
        } catch (error) {
            console.error ("error getting trip: ", error);
            throw error;
        }
    }

    // update trip data
    async updateTrip(tripId, updateData){
        try {
            const tripRef = doc(db, this.tripsCollection, tripId);
            await updateDoc( tripRef, {
                ...updateData,
                updatedAt: Timestamp.now()
            });


        } catch (error){
            console.error('Error updating trip:', error);
            throw error;

        }
    }

    // Add place to specific day
    /* the original place data:
    const place = {
    name: "Eiffel Tower",
    location: { latitude: 48.8584, longitude: 2.2945 },
    visitDuration: 90
    };

    await addPlaceToDay("trip123", "day2", place);

    const placeWithId = {
    name: "Eiffel Tower",
    location: { latitude: 48.8584, longitude: 2.2945 },
    visitDuration: 90,
    tempId: "1695481234567",
    addedAt: Timestamp {...}
    }

    say in Firestore, the original days.day1 = [],
    but now

    "days": {
    "day1": [
        {
        "name": "Eiffel Tower",
        "location": { "latitude": 48.8584, "longitude": 2.2945 },
        "visitDuration": 90,
        "tempId": "1695481234567",
        "addedAt": "<Firebase Timestamp>"
        }
    ]
    }

    */
    async addPlaceToDay(tripId, day, place){
        try {
            const tripRef = doc(db, this.tripsCollection, tripId);
            const placeWithId = {
                ...place,
                tempId: `${Date.now()}`, // Unique ID for this instance
                visitDuration: place.visitDuration || 60, // Default 1 hour
                addedAt: Timestamp.now()
            };

            await updateDoc( tripRef, {
                [`days.${day}`]: arrayUnion(placeWithId),
                updatedAt: Timestamp.now()
            }
            );

            return placeWithId;

        } catch (error){
            console.error('Error adding place to day:', error);
            throw error;

        }
    }


      // Remove place from day
        async removePlaceFromDay(tripId, day, place){
        try {
            const tripRef = doc(db, this.tripsCollection, tripId);

        } catch (error){
              console.error('Error adding place to day:', error);
            throw error;

        }
    }


       // Update entire day itinerary (for reordering)
        async updateDayItinerary(tripId, day, places){
        try {
            const tripRef = doc(db, this.tripsCollection, tripId);

        } catch (error){
              console.error('Error updating day itinerary:', error);
            throw error;

        }
    }

         // Update place duration
         async updatePlaceDuration(tripId, day, placeIndex, duration){
        try {
            const tripRef = doc(db, this.tripsCollection, tripId);

        } catch (error){
              console.error('Error updating day itinerary:', error);
            throw error;

        }
    }


       // Update place duration

        subscribeToTrip(tripId, callback){
        try {
            const tripRef = doc(db, this.tripsCollection, tripId);

        } catch (error){
              console.error('Error updating day itinerary:', error);
            throw error;

        }
    }
}

export default new FireStoreService();