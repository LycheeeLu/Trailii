import { GOOGLE_MAPS_API_KEY } from '../constants/config';

export default new GooglePlacesService();

class GooglePlacesService {
    constructor() {
        this.apikey = GOOGLE_MAPS_API_KEY;
        this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
    }

    // search for places near a location
    async searchNearby(latitude, longitude, radius = 5000, keyword = '') {
        try {
            const url = `${this.baseUrl}/place/nearbysearch/json` +
            `location=${latitude},${longitude}&` +
            `radius=${radius}&` +
            `type=tourist_attraction|restaurant|cafe|park|mall&`+
            `keyword=${keyword}&` +
            `key=${this.apikey}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status == 'OK'){
                return data.results.map(place => this.formatPlace(place))
            } else {
                throw new Error('Places API error: ${data.status}');
            }
        }
        catch (error) {
            console.error('Error fetching nearby places:', error);
            throw error;
        }
    }



    // search for places by text query
    async searchByText(query, latitude, longtitude){
        try {
            const url = `${this.baseUrl}/place/textsearch/json?` +
            `query=${encodeURIComponent(query)}&` +
            `location=${latitude},${longtitude}&` +
            `radius=5000&` +
            `key=${this.apikey}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK') {
                return data.results.map(place => this.formatPlace(place));
            } else {
                throw new Error(`Places API error: ${data.status}`);
            }

        } catch (error) {
            console.error('Error searching places by text:', error);
            throw error;
        }
    }

    // get detailed place info

    // format place data

    // format detailed place data

    // get photo url from photo

}