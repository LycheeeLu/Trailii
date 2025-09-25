export const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  return `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
};

export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
};

export const parseTimeString = (timeString) => {
  // Parse "9:00 AM" to minutes since midnight
  const [time, ampm] = timeString.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let totalMinutes = hours * 60 + minutes;

  if (ampm === 'PM' && hours !== 12) {
    totalMinutes += 12 * 60;
  } else if (ampm === 'AM' && hours === 12) {
    totalMinutes -= 12 * 60;
  }

  return totalMinutes;
};

export const addMinutes = (timeInMinutes, minutesToAdd) => {
  return (timeInMinutes + minutesToAdd) % (24 * 60);
};