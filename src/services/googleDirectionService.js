import { MAPS_API_KEY} from "../constants/config";

class GoogleDirectionService{
    constructor() {
        this.apiKey = MAPS_API_KEY;
        this.baseUrl = 'https://maps.googleapis.com/maps/api';
    }

    // get distance matrix betwen mulitple potns
    // ad
    async getDistanceMatrix(origins, destinations, mode = 'walking'){
        try{
            const originsStr = origins.map(o=> `${o.latitude},${o.longitude}`).join('|');
            const destinationsStr = destinations.map(d=> `${d.latitude},${d.longitude}`).join('|');

            const url = `${this.baseUrl}/distancematrix/json?` +
                `origins=${originsStr}&` +
                `destinations=${destinationsStr}&` +
                `mode=${mode}&` +
                `units=metric&` +
                `key=${this.apiKey}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK') {
                return this.parseDistanceMatrix(data);
            } else {
                throw new Error(`Distance Matrix API error: ${data.status}`);
            }

        } catch (error) {
            console.error('Error getting distance matrix: ', error);
            throw error;

        }
    }

    // get directions between two points
    async getDirections(origin, destination, waypoints=[], mode= 'walking'){
        try{
            let url = `${this.baseUrl}/directions/json?` +
                `origin=${origin.latitude},${origin.longitude}&` +
                `destination=${destination.latitude},${destination.longitude}&` +
                `mode=${mode}&` +
                `key=${this.apiKey}`;

            if (waypoints.length > 0) {
                const waypointsStr = waypoints
                    .map(wp => `${wp.latitude},${wp.longitude}`)
                    .join('|');

                url += `&waypoints=${waypointsStr}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK' && data.routes.length > 0) {
                return this.parseDirections(data.routes[0]);
            } else {
                throw new Error(`Directions API error: ${data.status}`);
            }
        } catch (error) {
                console.error('Error getting directions:', error);
                throw error;

        }
    }

    // parse distance matrix reponse
/* {
  "destination_addresses": ["New York, NY", "Philadelphia, PA"],
  "origin_addresses": ["Boston, MA", "Washington, DC"],
  "rows": [
    {
      "elements": [
        {
          "status": "OK",
          "distance": { "value": 350000, "text": "350 km" },
          "duration": { "value": 14400, "text": "4 hours" }
        },
        {
          "status": "OK",
          "distance": { "value": 450000, "text": "450 km" },
          "duration": { "value": 18000, "text": "5 hours" }
        }
      ]
    },
    {
      "elements": [
        {
          "status": "OK",
          "distance": { "value": 700000, "text": "700 km" },
          "duration": { "value": 25200, "text": "7 hours" }
        },
        {
          "status": "NOT_FOUND"
        }
      ]
    }
  ]
} */
// turn it into a 2 Dimension matrix
/* [
  // depart from Boston
  [
    { distance: 350000, duration: 14400, distanceText: "350 km", durationText: "4 hours" }, // Boston -> NY
    { distance: 450000, duration: 18000, distanceText: "450 km", durationText: "5 hours" }  // Boston -> Philly
  ],

  // depart from Washington
  [
    { distance: 700000, duration: 25200, distanceText: "700 km", durationText: "7 hours" }, // Washington -> NY
    { distance: 1000, duration: 600, distanceText: "1.0 km", durationText: "10 mins" }      // Washington -> Philly (fallback)
  ]
] */


    parseDistanceMatrix(data) {
        const matrix = [];

        data.rows.forEach((row, originIndex) => {
        matrix[originIndex] = [];
        row.elements.forEach((element, destIndex) => {
            if (element.status === 'OK') {
            matrix[originIndex][destIndex] = {
                distance: element.distance.value, // meters
                duration: element.duration.value, // seconds
                distanceText: element.distance.text,
                durationText: element.duration.text
            };
            } else {
            // Fallback for failed requests
            matrix[originIndex][destIndex] = {
                distance: 1000, // 1km fallback
                duration: 900,  // 15min fallback
                distanceText: '1.0 km',
                durationText: '15 mins'
            };
            }
        });
        });

        return matrix;
    }

    // Parse directions JSON response to frontend data structure
    // Directions API usually returns multiple legs/routs
/* {
  "legs": [
    {
      "distance": { "value": 3500, "text": "3.5 km" },
      "duration": { "value": 720, "text": "12 mins" },
      "steps": [
        {
          "html_instructions": "Head <b>north</b> on Main St",
          "distance": { "value": 500, "text": "0.5 km" },
          "duration": { "value": 120, "text": "2 mins" },
          "start_location": { "lat": 40.1, "lng": -74.1 },
          "end_location": { "lat": 40.2, "lng": -74.2 }
        },
        ...
      ]
    }
  ],
  "overview_polyline": {
    "points": "encoded_polyline_string"
  }
} */
    parseDirections(route) {
        const leg = route.legs[0];
        return {
        distance: leg.distance.value,
        duration: leg.duration.value,
        distanceText: leg.distance.text,
        durationText: leg.duration.text,
        steps: leg.steps.map(step => ({
            instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML
            distance: step.distance.text,
            duration: step.duration.text,
            startLocation: step.start_location,
            endLocation: step.end_location
        })),
        polyline: route.overview_polyline.points
        };
    }

    // get travel time between two points ( in minutes)
    // JSON → matrix → duration → minutes
    async getTravelTime(origin, destination, mode= 'walking'){
        try{
            const matrix = await this.getDistanceMatrix([origin],[destination], mode);
            return Math.ceil(matrix[0][0].duration / 60)
        } catch (error) {
            console.error('Error getting travel time: ', error);
            return 15;
            // fall back to 15 minutes
        }
    }
}
export default new GoogleDirectionService();