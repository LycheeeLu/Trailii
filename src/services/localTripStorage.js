import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildPlaceData, removeUndefined } from '../utils/placeUtils';

const STORAGE_KEY = 'trailii.trips';
const getDefaultDays = () => ({
    day1: [],
    day2: [],
    day3: [],
    day4: [],
    day5: [],
    day6: [],
    day7: [],
});

const nowISO = () => new Date().toISOString();

class LocalTripStorage {
    constructor() {
        this.storageKey = STORAGE_KEY;
    }

    async getTripsMap() {
        try {
            const raw = await AsyncStorage.getItem(this.storageKey);
            if (!raw) {
                return {};
            }
            return JSON.parse(raw);
        } catch (error) {
            console.error('Failed to read trips from AsyncStorage:', error);
            return {};
        }
    }

    async saveTripsMap(map) {
        await AsyncStorage.setItem(this.storageKey, JSON.stringify(map));
    }

    async createTrip(userId, tripData = {}) {
        const trips = await this.getTripsMap();
        const tripId = tripData.id || `trip_${Date.now()}_${userId}`;
        const trip = {
            id: tripId,
            userId,
            name: tripData.name || 'My Trip',
            destination: tripData.destination || '',
            startDate: tripData.startDate || nowISO(),
            endDate: tripData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            days: {
                ...getDefaultDays(),
                ...(tripData.days || {}),
            },
            createdAt: nowISO(),
            updatedAt: nowISO(),
        };
        trips[tripId] = trip;
        await this.saveTripsMap(trips);
        return trip;
    }

    async getTrip(tripId) {
        const trips = await this.getTripsMap();
        const trip = trips[tripId];
        if (!trip) {
            throw new Error(`Offline trip not found with ID: ${tripId}`);
        }
        return trip;
    }

    async updateTrip(tripId, updateData = {}) {
        const trips = await this.getTripsMap();
        const existing = trips[tripId];
        if (!existing) {
            throw new Error(`Offline trip not found with ID: ${tripId}`);
        }
        const sanitizedUpdates = removeUndefined(updateData);
        const updatedTrip = {
            ...existing,
            ...sanitizedUpdates,
            days: sanitizedUpdates.days
                ? { ...existing.days, ...sanitizedUpdates.days }
                : existing.days,
            updatedAt: nowISO(),
        };
        trips[tripId] = updatedTrip;
        await this.saveTripsMap(trips);
        return updatedTrip;
    }

    async addPlaceToDay(tripId, day, place) {
        const trips = await this.getTripsMap();
        const trip = trips[tripId];
        if (!trip) {
            throw new Error(`Offline trip not found with ID: ${tripId}`);
        }
        const cleanPlace = buildPlaceData(place);
        const placeWithId = {
            ...cleanPlace,
            tempId: `${Date.now()}`,
            visitDuration: cleanPlace.visitDuration || 60,
            addedAt: nowISO(),
        };
        const updatedTrip = {
            ...trip,
            days: {
                ...trip.days,
                [day]: [...(trip.days[day] || []), placeWithId],
            },
            updatedAt: nowISO(),
        };
        trips[tripId] = updatedTrip;
        await this.saveTripsMap(trips);
        return placeWithId;
    }

    async removePlaceFromDay(tripId, day, placeToRemove) {
        const trips = await this.getTripsMap();
        const trip = trips[tripId];
        if (!trip) {
            throw new Error(`Offline trip not found with ID: ${tripId}`);
        }
        const updatedTrip = {
            ...trip,
            days: {
                ...trip.days,
                [day]: (trip.days[day] || []).filter(
                    (place) =>
                        place.tempId !== placeToRemove.tempId &&
                        place.id !== placeToRemove.id
                ),
            },
            updatedAt: nowISO(),
        };
        trips[tripId] = updatedTrip;
        await this.saveTripsMap(trips);
    }

    async updateDayItinerary(tripId, day, places) {
        const trips = await this.getTripsMap();
        const trip = trips[tripId];
        if (!trip) {
            throw new Error(`Offline trip not found with ID: ${tripId}`);
        }
        const cleanPlaces = places.map((place) =>
            removeUndefined({
                ...place,
                visitDuration: place.visitDuration ?? 60,
            })
        );
        const updatedTrip = {
            ...trip,
            days: {
                ...trip.days,
                [day]: cleanPlaces,
            },
            updatedAt: nowISO(),
        };
        trips[tripId] = updatedTrip;
        await this.saveTripsMap(trips);
    }

    async updatePlaceDuration(tripId, day, placeIndex, duration) {
        const trips = await this.getTripsMap();
        const trip = trips[tripId];
        if (!trip) {
            throw new Error(`Offline trip not found with ID: ${tripId}`);
        }
        const dayPlaces = [...(trip.days[day] || [])];
        if (!dayPlaces[placeIndex]) {
            throw new Error('Place not found in itinerary');
        }
        dayPlaces[placeIndex] = {
            ...dayPlaces[placeIndex],
            visitDuration: duration,
        };
        const updatedTrip = {
            ...trip,
            days: {
                ...trip.days,
                [day]: dayPlaces,
            },
            updatedAt: nowISO(),
        };
        trips[tripId] = updatedTrip;
        await this.saveTripsMap(trips);
    }

    subscribeToTrip(tripId, callback) {
        let isActive = true;
        this.getTrip(tripId)
            .then((trip) => {
                if (isActive && typeof callback === 'function') {
                    callback(trip);
                }
            })
            .catch((error) => {
                console.error('Offline subscribe error:', error);
            });
        return () => {
            isActive = false;
        };
    }
}

export default new LocalTripStorage();
