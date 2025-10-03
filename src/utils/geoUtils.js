// Geographical utility functions

// Calculate distance between two points using Haversine formula
export const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadian(point2.latitude - point1.latitude);
  const dLon = toRadian(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadian(point1.latitude)) * Math.cos(toRadian(point2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance * 1000; // Convert to meters
};

const toRadian = (degree) => {
  return degree * (Math.PI / 180);
};

// Calculate center point of multiple coordinates
export const calculateCenter = (coordinates) => {
  if (coordinates.length === 0) return null;

  const sum = coordinates.reduce(
    (acc, coord) => ({
      latitude: acc.latitude + coord.latitude,
      longitude: acc.longitude + coord.longitude,
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: sum.latitude / coordinates.length,
    longitude: sum.longitude / coordinates.length,
  };
};

// Calculate bounding box for multiple coordinates
export const calculateBounds = (coordinates) => {
  if (coordinates.length === 0) return null;

  const lats = coordinates.map(coord => coord.latitude);
  const lngs = coordinates.map(coord => coord.longitude);

  return {
    minLatitude: Math.min(...lats),
    maxLatitude: Math.max(...lats),
    minLongitude: Math.min(...lngs),
    maxLongitude: Math.max(...lngs),
  };
};

// Generate map region from coordinates
export const getMapRegion = (coordinates, padding = 0.01) => {
  if (coordinates.length === 0) return null;

  if (coordinates.length === 1) {
    return {
      latitude: coordinates[0].latitude,
      longitude: coordinates[0].longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const bounds = calculateBounds(coordinates);
  const center = calculateCenter(coordinates);

  const latDelta = Math.max(
    bounds.maxLatitude - bounds.minLatitude + padding,
    0.01
  );
  const lngDelta = Math.max(
    bounds.maxLongitude - bounds.minLongitude + padding,
    0.01
  );

  return {
    latitude: center.latitude,
    longitude: center.longitude,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
};

// Check if point is within radius of another point
export const isWithinRadius = (center, point, radiusInMeters) => {
  const distance = calculateDistance(center, point);
  return distance <= radiusInMeters;
};

// Sort places by distance from a center point
export const sortByDistance = (places, centerPoint) => {
  return places
    .map(place => ({
      ...place,
      distanceFromCenter: calculateDistance(centerPoint, place.location)
    }))
    .sort((a, b) => a.distanceFromCenter - b.distanceFromCenter);
};