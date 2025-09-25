import { initializeApp } from "firebase/app";
import {initializeAuth, getReactNativePersistence} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { FIREBASE_CONFIG } from "../constants/config";

// Initialize Firebase
const app = initializeApp(FIREBASE_CONFIG);

// initialize firebase auth
let auth;
try{
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
} catch (error) {
    // if already initialized then retrieve the previous initialized instance
    if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }

}
export {auth} ;

// Initialize Firebase services

export const db = getFirestore(app);
export default app;