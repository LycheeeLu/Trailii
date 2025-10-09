import GoogleDirectionsService from './googleDirectionsService';
import { formatTime, addMinutes } from '../utils/timeUtils';
import { calculateDistance, sortByDistance } from '../utils/geoUtils';
import GooglePlacesService from './googlePlaceService';


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
            considerOpeningHours = true,
            maxIterations = 100
        } = options;

           if (places.length === 0) {
            return {optimizedPlaces: [],
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
            const optimizedRoute = this.twoOptImprovement(initialRoute, distanceMatrix, maxIterations);

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
            return this.fallbackOptimization(places, startTime, scheduleType);
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
        const hours = GooglePlacesService.parseOpeningHours(place.openingHours);
        return hours ;
    }


    // create detailed schedule with all information
    async createDetailedSchedule(places, distanceMatrix, startTime, scheduleType, considerOpeningHours) {
    const schedule = [];
    let currentTime = startTime;
    const warnings = [];
    const bufferTime = this.bufferTimes[scheduleType];

    console.log(`📅 Creating ${scheduleType} schedule starting at ${formatTime(startTime)}`);

    for (let i = 0; i < places.length; i++) {
      const place = places[i];
      const visitDuration = place.visitDuration || 60;

      // Add travel time from previous place
      let travelTime = 0;
      let travelInfo = null;

      if (i > 0) {
        const prevPlace = places[i - 1];
        const prevIndex = places.indexOf(prevPlace);
        const currentIndex = places.indexOf(place);

        if (distanceMatrix[prevIndex] && distanceMatrix[prevIndex][currentIndex]) {
          const travel = distanceMatrix[prevIndex][currentIndex];
          travelTime = Math.ceil(travel.duration / 60); // Convert to minutes
          travelInfo = {
            duration: travelTime,
            distance: travel.distance,
            durationText: travel.durationText || `${travelTime} min`,
            distanceText: travel.distanceText || `${(travel.distance / 1000).toFixed(1)} km`
          };
        } else {
          travelTime = this.defaultTravelTime;
          travelInfo = {
            duration: travelTime,
            durationText: `${travelTime} min`,
            distanceText: 'Unknown'
          };
        }

        currentTime = addMinutes(currentTime, travelTime + bufferTime);
      }

      const arrivalTime = currentTime;
      const departureTime = addMinutes(currentTime, visitDuration);

      // Check time constraints
      if (considerOpeningHours) {
        const openingHours = this.getOpeningHours(place);
        if (openingHours) {
          if (arrivalTime < openingHours.open) {
            warnings.push(`${place.name} may not be open at ${formatTime(arrivalTime)}`);
          }
          if (departureTime > openingHours.close) {
            warnings.push(`${place.name} closes before ${formatTime(departureTime)}`);
          }
        }
      }

      // Check if schedule is too late
      if (departureTime > this.defaultEndTime) {
        warnings.push(`Late schedule: ${place.name} ends at ${formatTime(departureTime)}`);
      }

      schedule.push({
        ...place,
        scheduledArrival: arrivalTime,
        scheduledDeparture: departureTime,
        arrivalTime: formatTime(arrivalTime),
        departureTime: formatTime(departureTime),
        visitDuration,
        travelFromPrevious: travelInfo,
        order: i + 1
      });

      currentTime = departureTime;
    }

    const totalTime = currentTime - startTime;
    const totalTravelTime = schedule.reduce((sum, place) =>
      sum + (place.travelFromPrevious?.duration || 0), 0
    );
    const totalVisitTime = schedule.reduce((sum, place) =>
      sum + place.visitDuration, 0
    );

    return {
      optimizedPlaces: schedule,
      totalTime,
      totalTimeText: this.formatDuration(totalTime),
      totalTravelTime,
      totalTravelTimeText: this.formatDuration(totalTravelTime),
      totalVisitTime,
      totalVisitTimeText: this.formatDuration(totalVisitTime),
      warnings,
      scheduleType,
      startTime: formatTime(startTime),
      endTime: formatTime(currentTime),
      bufferTime
    };
  }

  // Generate optimization insights
/*   generateOptimizationInsights(originalPlaces, optimizedPlaces, schedule, scheduleType) {
    const insights = [];

    // Calculate efficiency
    const totalDistance = optimizedPlaces.reduce((sum, place, index) => {
      if (index === 0) return sum;
      const prev = optimizedPlaces[index - 1];
      return sum + calculateDistance(prev.location, place.location);
    }, 0);

    const avgDistance = totalDistance / Math.max(1, optimizedPlaces.length - 1);

    insights.push({
      type: 'efficiency',
      title: 'Route Efficiency',
      message: `Average distance between stops: ${(avgDistance / 1000).toFixed(2)} km`,
      icon: 'trending-up'
    });

    // Check for time optimization
    if (schedule.totalTravelTime < schedule.totalVisitTime) {
      insights.push({
        type: 'success',
        title: 'Well Optimized',
        message: `Travel time (${schedule.totalTravelTimeText}) is less than visit time`,
        icon: 'checkmark-circle'
      });
    }

    // Schedule type recommendation
    const scheduleRecommendations = {
      tight: 'Maximizes attractions but may feel rushed',
      balanced: 'Good balance of sightseeing and relaxation',
      relaxed: 'Plenty of time to enjoy each place'
    };

    insights.push({
      type: 'info',
      title: `${scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1)} Schedule`,
      message: scheduleRecommendations[scheduleType],
      icon: 'information-circle'
    });

    // Warning for long days
    if (schedule.totalTime > 8 * 60) {
      insights.push({
        type: 'warning',
        title: 'Long Day Planned',
        message: `This is a ${this.formatDuration(schedule.totalTime)} day. Consider splitting across multiple days.`,
        icon: 'alert-circle'
      });
    }

    return insights;
  } */

  // Get distance matrix
  async getDistanceMatrix(places) {
    try {
      const locations = places.map(place => place.location);
      const matrix = await GoogleDirectionsService.getDistanceMatrix(
        locations,
        locations,
        this.travelMode
      );
      console.log('✅ Distance matrix retrieved from Google API');
      return matrix;
    } catch (error) {
      console.warn('⚠️ Google API failed, using fallback distance calculation');
      return this.createFallbackDistanceMatrix(places);
    }
  }

    // Fallback distance matrix
  createFallbackDistanceMatrix(places) {
    const matrix = [];

    places.forEach((place1, i) => {
      matrix[i] = [];
      places.forEach((place2, j) => {
        if (i === j) {
          matrix[i][j] = { duration: 0, distance: 0 };
        } else {
          const distance = calculateDistance(place1.location, place2.location);
          const duration = Math.max(300, distance / 1.4 * 60); // Walking speed ~1.4 m/s

          matrix[i][j] = {
            duration: duration,
            distance: distance,
            durationText: `${Math.ceil(duration / 60)} mins`,
            distanceText: `${(distance / 1000).toFixed(1)} km`
          };
        }
      });
    });

    return matrix;
  }
    // Single place schedule
  createSinglePlaceSchedule(place, startTime) {
    const visitDuration = place.visitDuration || 60;
    const arrivalTime = startTime;
    const departureTime = addMinutes(startTime, visitDuration);

    return {
      optimizedPlaces: [{
        ...place,
        scheduledArrival: arrivalTime,
        scheduledDeparture: departureTime,
        arrivalTime: formatTime(arrivalTime),
        departureTime: formatTime(departureTime),
        visitDuration,
        order: 1
      }],
      totalTime: visitDuration,
      totalTimeText: this.formatDuration(visitDuration),
      totalTravelTime: 0,
      totalTravelTimeText: '0 min',
      totalVisitTime: visitDuration,
      totalVisitTimeText: this.formatDuration(visitDuration),
      warnings: [],
      insights: [{
        type: 'info',
        title: 'Single Destination',
        message: 'Add more places for route optimization',
        icon: 'information-circle'
      }],
      scheduleType: 'single',
      startTime: formatTime(startTime),
      endTime: formatTime(departureTime)
    };
  }
  // Fallback optimization
  fallbackOptimization(places, startTime, scheduleType) {
    console.log('⚠️ Using fallback optimization');

    if (places.length > 1) {
      const center = {
        latitude: places.reduce((sum, p) => sum + p.location.latitude, 0) / places.length,
        longitude: places.reduce((sum, p) => sum + p.location.longitude, 0) / places.length
      };

      const sortedPlaces = sortByDistance(places, center);
      return this.createSimpleSchedule(sortedPlaces, startTime, scheduleType);
    }

    return this.createSinglePlaceSchedule(places[0], startTime);
  }

    // Simple schedule without API
  createSimpleSchedule(places, startTime, scheduleType) {
    const schedule = [];
    let currentTime = startTime;
    const bufferTime = this.bufferTimes[scheduleType];

    places.forEach((place, index) => {
      if (index > 0) {
        currentTime = addMinutes(currentTime, this.defaultTravelTime + bufferTime);
      }

      const visitDuration = place.visitDuration || 60;
      const arrivalTime = currentTime;
      const departureTime = addMinutes(currentTime, visitDuration);

      schedule.push({
        ...place,
        scheduledArrival: arrivalTime,
        scheduledDeparture: departureTime,
        arrivalTime: formatTime(arrivalTime),
        departureTime: formatTime(departureTime),
        visitDuration,
        order: index + 1
      });

      currentTime = departureTime;
    });

    return {
      optimizedPlaces: schedule,
      totalTime: currentTime - startTime,
      totalTimeText: this.formatDuration(currentTime - startTime),
      warnings: [],
      insights: [{
        type: 'info',
        title: 'Basic Optimization',
        message: 'Using geographical sorting',
        icon: 'information-circle'
      }],
      scheduleType,
      startTime: formatTime(startTime),
      endTime: formatTime(currentTime)
    };
  }

  formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  }

}

export default new RouteOptimizer();