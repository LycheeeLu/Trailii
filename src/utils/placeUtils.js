// utils/placeUtils.js

export const removeUndefined = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, removeUndefined(v)])
    );
  }
  return obj;
};

export const buildPlaceData = (place) => {
    const placeData = {
        id: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address || '',
        photos: place.photos ? place.photos.slice(0,10) : [],
    };

    // only add the following when the value is not undefined

  if (place.geometry?.location) {
    const lat =
      typeof place.geometry.location.lat === 'function'
        ? place.geometry.location.lat()
        : place.geometry.location.lat;

    const lng =
      typeof place.geometry.location.lng === 'function'
        ? place.geometry.location.lng()
        : place.geometry.location.lng;

    if (lat !== undefined && lng !== undefined) {
      placeData.location = { latitude: lat, longitude: lng };
    }
  }

    if (place.opening_hours && place.opening_hours.open_now !== undefined) {
        placeData.isOpen = place.opening_hours.open_now;
    }

    if (place.rating !== undefined) {
        placeData.rating = place.rating;
    }

    if (place.formatted_phone_number) {
        placeData.phoneNumber = place.formatted_phone_number;
    }

    if (place.website) {
        placeData.website = place.website;
    }

    return removeUndefined(placeData);
};