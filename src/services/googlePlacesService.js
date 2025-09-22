import {MAPS_API_KEY} from '../constants/config';

class GooglePlacesService {
    constructor() {
        this.apikey = MAPS_API_KEY;
        this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
    }

    // search for places near a location
    async searchNearby(latitude, longitude, radius = 5000, keyword = '') {
        try {
            const url = `${this.baseUrl}/nearbysearch/json?` +
            `location=${latitude},${longitude}&` +
            `radius=${radius}&` +
            `type=tourist_attraction|restaurant|cafe|park|mall&`+
            `keyword=${keyword}&` +
            `key=${this.apikey}`;

            console.log('Nearby Places URL:', url);

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
            const url = `${this.baseUrl}/textsearch/json?` +
            `query=${encodeURIComponent(query)}&` +
            `location=${latitude},${longtitude}&` +
            `radius=5000&` +
            `key=${this.apikey}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK') {
                return data.results.map(place => this.formatPlace(place));
            } else if (data.status === 'ZERO_RESULTS') {
                console.warn('No places found for query:', query);
                return [];
                //instead of throwing error, return empty array
            }

            else {
                throw new Error(`Places API error: ${data.status}`);
            }

        } catch (error) {
            console.error('Error searching places by text:', error);
            throw error;
        }
    }

    // get detailed place info
    async getPlaceDetails(placeId) {

        try {
            const fields = 'place_id,name,formatted_address,photos,opening_hours,website,rating,formatted_phone_number,geometry,types';
            const url = `${this.baseUrl}/details/json?` +
            `place_id=${placeId}&` +
            `fields=${fields}&` +
            `key=${this.apikey}`;

            const response = await fetch(url);

            const data = await response.json();
            console.log('PlaceDetails raw response:', data);

            if (data.status === 'OK') {
                return data.result;
            } else {
            throw new Error(`Places API error: ${data.status}`);
        }

        } catch (error) {
            console.error('Error fetching place details:', error);
            throw error;
        }
    }

    // format place data
    formatPlace(place) {
        return {
            id: place.place_id,
            name: place.name,
            address: place.vicinity || place.formatted_address || '',
            location: {
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
            },
            photos: place.photos ? place.photos.slice(0,5) : [],
            isOpen: place.opening_hours ? place.opening_hours.open_now : null,
            rating: place.rating || null,
            phoneNumber: place.formatted_phone_number || null,
            website: place.website || null,

        };
    }


    // format detailed place data
    formatPlaceDetails(place) {
    return {
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      location: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      },
      rating: place.rating,
      priceLevel: place.price_level,
      types: place.types,
      photos: place.photos || [],
      website: place.website,
      phoneNumber: place.formatted_phone_number,
      openingHours: place.opening_hours,
      isOpen: place.opening_hours?.open_now,
    };
  }

    // get photo url from photo
    getPhotoUrl(photoReference, maxWidth = 400) {
        return `${this.baseUrl}/place/photo?` +
        `maxwidth=${maxWidth}&` +
        `photoreference=${photoReference}&` +
        `key=${this.apikey}`;
    }

}

export default new GooglePlacesService();