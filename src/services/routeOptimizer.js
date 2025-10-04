import GoogleDirectionService from './googleDirectionsService';
import { formatTime, addMinutes, isWithinBusinessHours, parseTimeString } from '../utils/timeUtils';
import { calculateDistance, sortByDistance } from '../utils/geoUtils';

class RouteOptimizer {
    constructor() {
        this.travelMode = 'walking';
        this.defaultTravelTime = 15; // minutes between places
        this.bufferTimes = {
            tight: 10,
            balanced: 20,
            relaxed: 30
        };
        this.defaultStartTime = 10 * 60; // 10:00 AM
        this.defaultEndTime = 20 * 60; // 8:00 PM
    }

    // main optimization with TSP algorithm
    async optimizeRoute(places, options = {}) {
        const {
            startTime = this.defaultStartTime,
            scheduleType = 'balanced',
            startLocation = null,
            endLocation = null,
            considerOpeningsHours = true,
            maxIterations = 100
        } = options;

           if (places.length === 0) {
            return {optmizedPlaces: [],
                    totalTime: 0,
                    warining: [],
                    insights: []
            };
         }

         if (places.length === 1) {
            return this.createSinglePlaceSchedule(places[0], startTime);
         }
         console.log(`🚀 Optimizing route for ${places.length} places with ${scheduleType} schedule`);

         try {
            // step 1: get distance matrix
            const distanceMatrix = await this.getDistanceMatrix(places);
            // step 2: apply TSP optimization
            const initialRoute = this.nearestNeighborTSP(places, distanceMatrix);
            const optmizedRoute = this.twoOptImprovement(initialRoute, distanceMatrix, maxIterations);

            // step 3: apply time window constraints
            let finalRoute = optimizedRoute;
            if (considerOpeningHours) {
                finalRoute = this.applyTimeConstraints(optimizedRoute, startTime);
            }

            // step 4: create detailed schedule
            const schedule = await this.createDetailedSchedule(
                finalRoute,
                distanceMatrix,
                startTime,
                scheduleType,
                considerOpeningHours
            );

            // step 5: generate insights
            const insights = this.generateOptimizationInsights(
                places,
                optimizedRoute,
                schedule,
                scheduleType
            );

            return {
                ...schedule,
                insights,
                algorithm: 'nearest-neighbor + 2-opt',
                scheduleType
            };


         } catch (error) {
            console.error('Route optimization error: ', error);
            return this.fallbackOptmization(places, startTime, scheduleType);
         }
    }


    // the nearest neighbor TSP algorithm
    nearestNeighborTSP(places, distanceMatrix){
        if(places.length <= 2) return places;

        const unvisited = new Set(places.map((_, index) => index));
        const route = [];
        let currentIndex = 0;

        route.push(currentIndex);
        unvisited.delete(currentIndex);

        while (unvisited.size > 0) {
            let nearestIndex = -1;
            let shortestDistance = Infinity;

            for (const index of unvisited){
                const distance = distanceMatrix[currentIndex][index].duration;
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    nearestIndex = index;
                }
            }
            route.push(nearestIndex);
            unvisited.delete(nearestIndex);
            currentIndex = nearestIndex;

        }
        console.log(`Nearest Neighbor route: ${route.join(' -> ')}`);
        return route.map(index => places[index]);
    }

    // 2-Opt improvement algorithm reduces route crossing
    twoOptImprovement(route, distanceMatrix, maxIterations = 100){
        // needs at least 4 points for 2-opt
        if (route.length < 4) return route;
        let improved = true;
        let iterations = 0;
        let currentRoute = [...route];
        let bestDistance = this.calculateTotalDistance(currentRoute, distanceMatrix);
        console.log(`Starting 2-opt improvement. Initial distance: ${bestDistance.toFixed(2)}`);
        while (improved && iterations < maxIterations){
            improved = false;
            iterations++;

            for (let i = 1; i < currentRoute.length - 2; i ++){
                for (let j = i + 1; j < currentRoute.length - 1; j ++){
                    // try reverse the segment between i and j
                    const newRoute = this.twoOptSwap(currentRoute, i , j);
                    const newDistance = this.calculateTotalDistance(newRoute, distanceMatrix);

                    if (newDistance < bestDistance) {
                        currentRoute = newRoute;
                        bestDistance = newDistance;
                        improved = true;
                        console.log(`Improvement found at iteration ${iterations}: ${newDistance.toFixed(2)}`);
                        break;
                    }
                }
                if (improved) break;
            }
        }
            console.log(`2-opt completed after ${iterations} iterations. Final distance: ${bestDistance.toFixed(2)}`);
            return currentRoute;

    }

    // helper for 2-opt swap
    twoOptSwap(route, i, j){
        const newRoute = [
            ...route.slice(0, i),
            ...route.slice(i, j+ 1).reverse(),
            ...route.slice(j+1)
        ];
        return newRoute;
    }

    // calculate total route distance
    calculateTotalDistance(route, distanceMatrix){
        let totalDistance = 0;
        const places = route;

        for (let i = 0; i < places.length - 1; i ++){
            const fromIndex = places.indexOf(places[i]);
            const toIndex = places.indexOf(places[i + 1]);

            if (distanceMatrix[fromIndex] && distanceMatrix[fromIndex][toIndex]){
                totalDistance += distanceMatrix[fromIndex][toIndex].duration;
            }
        }

        return totalDistance;
    }

    //apply time window constraints
    applyTimeConstraints(route, startTime){
        const constrainedRoute = [];
        const scheduledPlaces = new Map();
        let currentTime = startTime;
        for (const place of route) {
            const openingHours = this.getOpeningHours(place);

            // no constraints, add directly
            if (!openingHours){
                constrainedRoute.push(place);
                scheduledPlaces.set(place.id, currentTime);
                currentTime = addMinutes(currentTime, place.vistDuration || 60);
                continue;

            }

            const {open, close} = openingHours;
            // arrive before opening, adust start time
          if (currentTime < open) {
            console.log(`⏰ ${place.name} opens at ${formatTime(open)}, adjusting arrival`);
            currentTime = open;
            }
            // check if the visit can be fitted in before closing
            const visitEnd = addMinutes(currentTime, place.visitDuration || 60);
                  if (currentTime >= open && visitEnd <= close) {
                constrainedRoute.push(place);
                scheduledPlaces.set(place.id, currentTime);
                currentTime = visitEnd;
                    } else {
                        console.log(`⚠️ ${place.name} cannot be visited (closes at ${formatTime(close)})`);
                    }
         }
        return constrainedRoute;
    }

    // get opening hours
    getOpeningHours(place){
        if (!place.openingHours || !place.openingHours.weekday_text) {
        return null;
        }
        // Check if place has isOpen status
        if (place.openingHours.open_now !== undefined) {
        return place.openingHours.open_now ? defaultHours : null;
        }

        return defaultHours;

    }


}