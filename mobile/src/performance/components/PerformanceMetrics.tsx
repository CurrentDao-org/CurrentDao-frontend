import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useMobilePerformance } from '../hooks/useMobilePerformance';

interface PerformanceMetricsProps {
  refreshInterval?: number;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  refreshInterval = 5000,
}) => {
  const { metrics, isMonitoring } = useMobilePerformance();
  const [currentMetrics, setCurrentMetrics] = useState(metrics);

  useEffect(() => {
    setCurrentMetrics(metrics);
  }, [metrics]);

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setCurrentMetrics(metrics);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [metrics, isMonitoring, refreshInterval]);

  if (!currentMetrics) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Performance Metrics</Text>
        <Text style={styles.loading}>Loading metrics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Performance Metrics</Text>

      <View style={styles.metricContainer}>
        <Text style={styles.metricLabel}>Battery Level:</Text>
        <Text style={styles.metricValue}>{currentMetrics.batteryLevel}%</Text>
      </View>

      <View style={styles.metricContainer}>
        <Text style={styles.metricLabel}>Memory Usage:</Text>
        <Text style={styles.metricValue}>{currentMetrics.memoryUsage} MB</Text>
      </View>

      <View style={styles.metricContainer}>
        <Text style={styles.metricLabel}>Network Requests:</Text>
        <Text style={styles.metricValue}>{currentMetrics.networkRequests}</Text>
      </View>

      <View style={styles.metricContainer}>
        <Text style={styles.metricLabel}>App Launch Time:</Text>
        <Text style={styles.metricValue}>{currentMetrics.appLaunchTime.toFixed(2)} ms</Text>
      </View>

      <View style={styles.metricContainer}>
        <Text style={styles.metricLabel}>Frame Rate:</Text>
        <Text style={styles.metricValue}>{currentMetrics.frameRate} FPS</Text>
      </View>

      <View style={styles.metricContainer}>
        <Text style={styles.metricLabel}>Last Updated:</Text>
        <Text style={styles.metricValue}>
          {new Date(currentMetrics.timestamp).toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Monitoring Status:</Text>
        <Text style={[styles.statusValue, { color: isMonitoring ? 'green' : 'red' }]}>
          {isMonitoring ? 'Active' : 'Inactive'}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loading: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  metricContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    marginTop: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});