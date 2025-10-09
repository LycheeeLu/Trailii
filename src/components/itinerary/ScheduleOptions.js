import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/config';

const SCHEDULE_TYPES = [
  {
    type: 'tight',
    title: 'Tight Schedule',
    description: 'Maximize attractions, minimal buffer time',
    icon: 'flash',
    color: COLORS.danger,
    bufferTime: '10 min between places'
  },
  {
    type: 'balanced',
    title: 'Balanced Schedule',
    description: 'Good mix of sightseeing and rest time',
    icon: 'balance',
    color: COLORS.primary,
    bufferTime: '20 min between places'
  },
  {
    type: 'relaxed',
    title: 'Relaxed Schedule',
    description: 'Plenty of time to enjoy each place',
    icon: 'leaf',
    color: COLORS.success,
    bufferTime: '30 min between places'
  }
];

const START_TIME_OPTIONS = [
  { value: 9 * 60, label: '9:00 AM' },
  { value: 10 * 60, label: '10:00 AM' },
  { value: 11 * 60, label: '11:00 AM' },
];

const ScheduleOptions = ({ visible, onClose, onOptimize, currentOptions = {} }) => {
  const [scheduleType, setScheduleType] = useState(currentOptions.scheduleType || 'balanced');
  const [startTime, setStartTime] = useState(currentOptions.startTime || 9 * 60);

  const handleOptimize = () => {
    onOptimize({
      scheduleType,
      startTime
    });
    onClose();
  };

    const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Optimize Schedule</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Schedule Type Selection */}
            <Text style={styles.sectionTitle}>Pace your day</Text>
            {SCHEDULE_TYPES.map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.optionCard,
                  scheduleType === option.type && styles.selectedOption
                ]}
                onPress={() => setScheduleType(option.type)}
                activeOpacity={0.7}
              >
                <View style={styles.optionHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
                    <Ionicons name={option.icon} size={24} color={option.color} />
                  </View>
                  <View style={styles.optionInfo}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                    <Text style={styles.bufferTime}>{option.bufferTime}</Text>
                  </View>
                  {scheduleType === option.type && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Start Time Selection */}
            <Text style={styles.sectionTitle}>Start Time</Text>
            <View style={styles.timeOptionsContainer}>
              {START_TIME_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.timeOption,
                    startTime === option.value && styles.selectedTimeOption
                  ]}
                  onPress={() => setStartTime(option.value)}
                  activeOpacity={0.7}
                >
                   <Ionicons
                    name={option.icon}
                    size={20}
                    color={startTime === option.value ? COLORS.white : COLORS.primary}
                  />
                  <Text style={[
                    styles.timeOptionText,
                    startTime === option.value && styles.selectedTimeOptionText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Preview */}
            <View style={styles.previewContainer}>
            <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
              <Text style={styles.previewTitle}>Preview</Text>
              <View style={styles.previewContent}>
                <Text style={styles.previewText}>
                  Schedule: {SCHEDULE_TYPES.find(t => t.type === scheduleType)?.title}
                </Text>
                <Text style={styles.previewText}>
                  Start time: {formatTime(startTime)}
                </Text>
              </View>
            </View>

          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optimizeButton} onPress={handleOptimize}>
              <Text style={styles.optimizeButtonText}>Optimize Route</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    height: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
    headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 15,
    marginTop: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 15,
  },
  optionCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  bufferTime: {
    fontSize: 12,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  timeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  timeOption: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedTimeOption: {
    backgroundColor: COLORS.primary,
  },
  timeOptionText: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
  selectedTimeOptionText: {
    color: COLORS.white,
  },
  previewContainer: {
    backgroundColor: COLORS.lightGray + '80',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 10,
  },
  previewContent: {
    paddingLeft: 10,
  },
  previewText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 5,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
  },
  optimizeButton: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  optimizeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ScheduleOptions;