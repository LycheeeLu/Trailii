export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "traili-cae40.firebaseapp.com",
  projectId: "traili-cae40",
  storageBucket: "traili-cae40.firebasestorage.app",
  messagingSenderId: "909320635869",
  appId: "1:909320635869:web:cff4155a068604ca706234",
  measurementId: "G-YP9W6GFFXQ"
};


if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is not defined in .env file');
}

if (!FIREBASE_CONFIG.apiKey) {
  throw new Error('Firebase configuration is missing. Check your .env file');
}




export const COLORS = {
    primary: '#FF6F00',
    primaryLight: '#FFA040',
    primaryDark: '#E65100',

    secondary: '#FF8F00',

    success: '#34C759',
    warning: '#FFB300',
    danger: '#FF3B30',

    background: '#FFF8F1',
    surface: '#FFFFFF', //card, component
    border: '#FFE0B2', // divider

    white: '#FFFFFF',
    black: '#000000',
    gray: '#8E8E93',
    lightGray: '#F2F2F7',

    textPrimary: '#212121',
    textSecondary: '#616161'

}

export const SIZES = {
  base: 8,
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
};