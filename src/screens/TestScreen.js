import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/config';
import { testOptimization, compareOptimizations, TEST_ROUTES } from '../utils/optimizationTester';

const TestScreen = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);

  const runTest = async () => {
    setTesting(true);
    try {
      const testResults = await testOptimization(TEST_ROUTES.stockholm);
      setResults(testResults);
      compareOptimizations(testResults);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Optimization Tester</Text>
        <Text style={styles.subtitle}>Day 9-10 Features</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={[styles.testButton, testing && styles.testButtonDisabled]}
          onPress={runTest}
          disabled={testing}
        >
          {testing ? (
            <>
              <ActivityIndicator color={COLORS.white} />
              <Text style={styles.testButtonText}>Running Tests...</Text>
            </>
          ) : (
            <>
              <Ionicons name="flask" size={20} color={COLORS.white} />
              <Text style={styles.testButtonText}>Run Optimization Test</Text>
            </>
          )}
        </TouchableOpacity>

        {results && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Test Results</Text>

            {Object.entries(results).map(([type, result]) => (
              <View key={type} style={styles.resultCard}>
                <Text style={styles.resultType}>{type.toUpperCase()} Schedule</Text>
                <Text style={styles.resultDetail}>Duration: {result.totalTimeText}</Text>
                <Text style={styles.resultDetail}>Travel: {result.totalTravelTimeText}</Text>
                <Text style={styles.resultDetail}>Visits: {result.totalVisitTimeText}</Text>
                <Text style={styles.resultDetail}>
                  Time: {result.startTime} - {result.endTime}
                </Text>
                <Text style={styles.resultDetail}>
                  Computation: {result.computationTime}ms
                </Text>
                {result.warnings.length > 0 && (
                  <Text style={styles.warningText}>
                    ⚠️ {result.warnings.length} warnings
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.featuresList}>
          <Text style={styles.featuresTitle}>✅ Implemented Features</Text>
          <FeatureItem text="TSP Nearest Neighbor Algorithm" />
          <FeatureItem text="2-Opt Route Improvement" />
          <FeatureItem text="Time Window Constraints" />
          <FeatureItem text="Opening Hours Validation" />
          <FeatureItem text="Tight/Balanced/Relaxed Schedules" />
          <FeatureItem text="Distance Matrix API Integration" />
          <FeatureItem text="Fallback Optimization" />
          <FeatureItem text="Optimization Insights" />
          <FeatureItem text="Real-time Route Calculation" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const FeatureItem = ({ text }) => (
  <View style={styles.featureItem}>
    <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white + 'CC',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  testButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  resultCard: {
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  resultType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  resultDetail: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: COLORS.warning,
    marginTop: 5,
  },
  featuresList: {
    marginTop: 30,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.black,
    marginLeft: 10,
  },
});

export default TestScreen;