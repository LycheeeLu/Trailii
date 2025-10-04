import { Alert } from 'react-native';

export class TrailiError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = null) {
    super(message);
    this.name = 'TrailiError';
    this.code = code;
    this.details = details;
  }
}

export const handleApiError = (error, context = '') => {
  console.error(`API Error in ${context}:`, error);

  if (error.name === 'TrailiError') {
    switch (error.code) {
      case 'QUOTA_EXCEEDED':
        return 'API quota exceeded. Please try again later.';
      case 'INVALID_REQUEST':
        return 'Invalid request. Please check your input.';
      case 'NETWORK_ERROR':
        return 'Network error. Please check your internet connection.';
      default:
        return error.message;
    }
  }

  if (error.message.includes('fetch')) {
    return 'Network error. Please check your internet connection.';
  }

  return 'Something went wrong. Please try again.';
};

export const showErrorAlert = (error, context = '') => {
  const message = handleApiError(error, context);
  Alert.alert('Error', message, [{ text: 'OK' }]);
};

export const handleFirestoreError = (error) => {
  console.error('Firestore Error:', error);

  if (error.code === 'permission-denied') {
    return 'Permission denied. Please check your authentication.';
  }

  if (error.code === 'unavailable') {
    return 'Service temporarily unavailable. Please try again.';
  }

  return 'Database error. Please try again.';
};