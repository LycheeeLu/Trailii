# Trailii Overview

## Tech Stack
- **Framework**: React Native (Expo SDK 54) with React Navigation tabs.
- **Languages**: JavaScript/JSX.
- **UI**: React Native components, `react-native-maps`, `@expo/vector-icons`.
- **Backend/Services**:
  - Firebase Auth + Firestore for cloud storage.
  - AsyncStorage for offline/local persistence.
  - Google Maps / Places APIs via custom service wrappers.

## Essential Features & Logic
1. **Itinerary Planner**
   - Central `TripContext` loads a trip, exposes CRUD helpers, and subscribes to changes (Firestore or local).
   - Day tabs show per-day places, durations, and mock schedule estimates; users can reorder and adjust visit durations.
2. **Map Experience**
   - Uses Expo Location to request permission, fetch the device position, and load nearby places.
   - Map markers show current location plus selected/nearby places; a `SearchBar` invokes Google Places `searchNearby`.
   - Selecting markers displays a `PlaceCard` modal with details and actions.
3. **Route Optimization Engine**
   - `routeOptimizer` pulls a Google Distance Matrix, runs a **nearest-neighbor TSP** followed by **2‑opt** edge swaps to trim roundabout walking paths, and respects walking buffers (tight/balanced/relaxed schedules).
   - Opening-hour constraints reshuffle late/closed POIs by delaying visits or skipping those that cannot fit before closing, so the daily plan stays realistic.
   - Detailed schedules include arrival/departure slots, travel segments, and warnings (e.g., “arrives before opening”, “late day”) with fallbacks when Google APIs are unavailable.
4. **Dual Storage Modes**
   - UI toggle lets users switch between **online** (Firestore) and **offline** (AsyncStorage) storage.
   - Provider tracks trip IDs per mode so switching restores the previous data set.
5. **Real-Time Updates**
   - Firestore `onSnapshot` keeps itinerary state in sync across devices; local mode simulates a one-time push.

## Running Locally
1. **Prerequisites**
   - Node.js 20+, npm.
   - Expo CLI (`npm install -g expo-cli`).
   - Google Maps + Firebase credentials in `.env` consumed by `@env`.
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Start the Expo dev server**
   ```bash
   npm start
   ```
   Use the Expo Go app or emulator (iOS/Android/web) to load the bundle.
4. **Environment**
   - Ensure `GOOGLE_MAPS_API_KEY` and `FIREBASE_API_KEY` are defined for map/Firestore access.

## App Structure
- **Frontend (React Native)**
  - `App.js` sets up the tab navigator with **Itinerary** and **Map** screens inside `TripProvider`.
  - `src/screens/ItineraryScreen.js` – itinerary UI, storage toggle, day tabs.
  - `src/screens/MapScreen.js` – map view, location permission flow, markers, search.
  - `src/components/**` – reusable UI (DayTab, SearchBar, PlaceCard, etc.).
- **State & Context**
  - `src/contexts/TripContext.js` – global trip state, storage mode management.
- **Services**
  - `src/services/firebaseService.js` & `fireStoreService.js` – Firebase bootstrap and CRUD.
  - `src/services/localTripStorage.js` – AsyncStorage-backed trip persistence.
- `src/services/googlePlacesService.js`, `googleDirectionsService.js`, `routeOptimizer.js` – API integrations; the optimizer orchestrates distance-matrix fetches, nearest-neighbor ordering, 2‑opt refinement, opening-hour validation, and fallback heuristics to keep walking loops efficient.
- **Config & Utils**
  - `src/constants/config.js` – color palette, keys, Firebase config.
  - `src/utils/placeUtils.js` – helpers for sanitizing place objects.
