import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/config';

const OptimizationResults = ({ visible, onClose, results, onApply, onCancel }) => {
  if (!results) return null;

/*   const getInsightIcon = (type) => {
    const icons = {
      success: 'checkmark-circle',
      warning: 'alert-circle',
      info: 'information-circle',
      efficiency: 'trending-up'
    };
    return icons[type] || 'information-circle';
  };

  const getInsightColor = (type) => {
    const colors = {
      success: COLORS.success,
      warning: COLORS.warning,
      info: COLORS.primary,
      efficiency: COLORS.secondary
    };
    return colors[type] || COLORS.gray;
  }; */

  const handleApply = () => {
    Alert.alert(
      'Apply Optimization',
      `This will replace your current itinerary with the optimized ${results.optimizedPlaces.length}-place route.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          style: 'default',
          onPress: () => {
            onApply(results);
            onClose();
          }
        }
      ]
    );
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
            <View style={styles.headerLeft}>
              <Ionicons name="flash" size={24} color={COLORS.primary} />
              <Text style={styles.title}>Route Optimized!</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Summary Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons name="time-outline" size={24} color={COLORS.primary} />
                <Text style={styles.statValue}>{results.totalTimeText}</Text>
                <Text style={styles.statLabel}>Total Time</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="walk-outline" size={24} color={COLORS.secondary} />
                <Text style={styles.statValue}>{results.totalTravelTimeText}</Text>
                <Text style={styles.statLabel}>Travel Time</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="location-outline" size={24} color={COLORS.success} />
                <Text style={styles.statValue}>{results.optimizedPlaces.length}</Text>
                <Text style={styles.statLabel}>Places</Text>
              </View>
            </View>

            {/* Schedule Info */}
            <View style={styles.scheduleInfo}>
              <View style={styles.scheduleRow}>
                <Ionicons name="play-circle-outline" size={18} color={COLORS.primary} />
                <Text style={styles.scheduleText}>Start: {results.startTime}</Text>
              </View>
              <View style={styles.scheduleRow}>
                <Ionicons name="stop-circle-outline" size={18} color={COLORS.danger} />
                <Text style={styles.scheduleText}>End: {results.endTime}</Text>
              </View>
              <View style={styles.scheduleRow}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.secondary} />
                <Text style={styles.scheduleText}>
                  Schedule: {results.scheduleType.charAt(0).toUpperCase() + results.scheduleType.slice(1)}
                </Text>
              </View>
            </View>

            {/* Optimized Route */}
            <Text style={styles.sectionTitle}>Optimized Route</Text>
            <View style={styles.routeContainer}>
              {results.optimizedPlaces.map((place, index) => (
                <View key={place.tempId || place.id}>
                  <View style={styles.routeItem}>
                    <View style={styles.routeNumber}>
                      <Text style={styles.routeNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.routeInfo}>
                      <Text style={styles.routePlaceName}>{place.name}</Text>
                      <Text style={styles.routeTime}>
                        {place.arrivalTime} - {place.departureTime} ({place.visitDuration} min)
                      </Text>
                    </View>
                  </View>

                  {/* Travel info to next place */}
                  {index < results.optimizedPlaces.length - 1 && place.travelFromPrevious && (
                    <View style={styles.travelInfo}>
                      <Ionicons name="walk" size={14} color={COLORS.gray} />
                      <Text style={styles.travelText}>
                        {results.optimizedPlaces[index + 1].travelFromPrevious?.durationText} • {results.optimizedPlaces[index + 1].travelFromPrevious?.distanceText}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Insights */}
{/*             {results.insights && results.insights.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Insights</Text>
                {results.insights.map((insight, index) => (
                  <View
                    key={index}
                    style={[styles.insightCard, { borderLeftColor: getInsightColor(insight.type) }]}
                  >
                    <Ionicons
                      name={getInsightIcon(insight.type)}
                      size={20}
                      color={getInsightColor(insight.type)}
                    />
                    <View style={styles.insightContent}>
                      <Text style={styles.insightTitle}>{insight.title}</Text>
                      <Text style={styles.insightMessage}>{insight.message}</Text>
                    </View>
                  </View>
                ))}
              </>
            )} */}

            {/* Warnings */}
{/*             {results.warnings && results.warnings.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Warnings</Text>
                {results.warnings.map((warning, index) => (
                  <View key={index} style={styles.warningCard}>
                    <Ionicons name="warning" size={18} color={COLORS.warning} />
                    <Text style={styles.warningText}>{warning}</Text>
                  </View>
                ))}
              </>
            )} */}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Ionicons name="checkmark" size={20} color={COLORS.white} />
              <Text style={styles.applyButtonText}>Apply Route</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    Height: '90%',
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
    marginLeft: 10,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  scheduleInfo: {
    backgroundColor: COLORS.primary + '10',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 14,
    color: COLORS.black,
    marginLeft: 10,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginTop: 10,
    marginBottom: 15,
  },
  routeContainer: {
    marginBottom: 20,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 10,
    marginBottom: 5,
  },
  routeNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeNumberText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  routeInfo: {
    flex: 1,
  },
  routePlaceName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  routeTime: {
    fontSize: 13,
    color: COLORS.gray,
  },
  travelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 42,
    paddingVertical: 8,
  },
  travelText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 6,
  },
/*   insightCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  insightMessage: {
    fontSize: 13,
    color: COLORS.gray,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.black,
    marginLeft: 10,
  }, */
  actions: {
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
  applyButton: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },
});

export default OptimizationResults;