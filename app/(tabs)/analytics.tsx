import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Target, Wifi } from 'lucide-react-native';

import { pingService } from '../../services/pingService';
import { PingResult } from '../../types';
import StatsCard from '../../components/StatsCard';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const [pingResults, setPingResults] = useState<PingResult[]>([]);

  useEffect(() => {
    // Update results every second
    const interval = setInterval(() => {
      setPingResults(pingService.getResults());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getChartData = () => {
    return pingResults
      .filter(r => r.status === 'success')
      .slice(-20)
      .map((result, index) => ({
        index,
        ping: result.latency,
        time: new Date(result.timestamp).toLocaleTimeString('en-US', {
          hour12: false,
          minute: '2-digit',
          second: '2-digit'
        })
      }));
  };

  const getSuccessRate = () => {
    if (pingResults.length === 0) return 0;
    const successful = pingResults.filter(r => r.status === 'success').length;
    return Math.round((successful / pingResults.length) * 100);
  };

  const getMinPing = () => {
    const successful = pingResults.filter(r => r.status === 'success');
    if (successful.length === 0) return 0;
    return Math.min(...successful.map(r => r.latency));
  };

  const getMaxPing = () => {
    const successful = pingResults.filter(r => r.status === 'success');
    if (successful.length === 0) return 0;
    return Math.max(...successful.map(r => r.latency));
  };

  const chartData = getChartData();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Detailed connection performance</Text>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.statsGrid}>
          <StatsCard
            title="Success Rate"
            value={`${getSuccessRate()}%`}
            subtitle="Connection reliability"
            trend={getSuccessRate() > 90 ? 'up' : getSuccessRate() > 70 ? 'neutral' : 'down'}
            icon="ping"
            delay={0}
          />
          <StatsCard
            title="Tests Run"
            value={pingResults.length.toString()}
            subtitle="Total ping tests"
            icon="speed"
            delay={100}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)} style={styles.statsGrid}>
          <StatsCard
            title="Best Ping"
            value={getMinPing() ? `${getMinPing()}ms` : '--'}
            subtitle="Lowest latency"
            trend="up"
            delay={200}
          />
          <StatsCard
            title="Worst Ping"
            value={getMaxPing() ? `${getMaxPing()}ms` : '--'}
            subtitle="Highest latency"
            trend="down"
            delay={300}
          />
        </Animated.View>

        {/* Chart */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Ping History</Text>
          {chartData.length > 0 ? (
            <View style={styles.chart}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#666' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#666' }}
                    domain={['dataMin - 10', 'dataMax + 10']}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      border: 'none',
                      borderRadius: 8,
                      color: '#FFFFFF'
                    }}
                    labelFormatter={(value) => `Time: ${value}`}
                    formatter={(value: number) => [`${value}ms`, 'Ping']}
                  />
                  <Line
                    type="monotone"
                    dataKey="ping"
                    stroke="#007AFF"
                    strokeWidth={3}
                    dot={{ fill: '#007AFF', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#007AFF', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </View>
          ) : (
            <View style={styles.emptyChart}>
              <Wifi size={48} color="#CCC" />
              <Text style={styles.emptyText}>No data available</Text>
              <Text style={styles.emptySubtext}>Start testing to see analytics</Text>
            </View>
          )}
        </Animated.View>

        {/* Performance Insights */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>Performance Insights</Text>
          
          <View style={styles.insightItem}>
            <View style={styles.insightIcon}>
              <Target size={20} color="#34C759" />
            </View>
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Connection Quality</Text>
              <Text style={styles.insightSubtitle}>
                {getAveragePing() < 50 ? 'Excellent - Perfect for gaming and streaming' :
                 getAveragePing() < 100 ? 'Good - Suitable for most activities' :
                 'Poor - Consider optimization'}
              </Text>
            </View>
          </View>

          <View style={styles.insightItem}>
            <View style={styles.insightIcon}>
              <Clock size={20} color="#FF9500" />
            </View>
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Stability</Text>
              <Text style={styles.insightSubtitle}>
                {getSuccessRate() > 95 ? 'Very stable connection' :
                 getSuccessRate() > 80 ? 'Mostly stable' :
                 'Unstable - Check your network'}
              </Text>
            </View>
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  chart: {
    height: 200,
  },
  emptyChart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  insightsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  insightText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  insightSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});