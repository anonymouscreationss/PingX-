import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CustomSVGLogo from '../../components/CustomSVGLogo';
import PingButton from '../../components/PingButton';
import ServerSelector from '../../components/ServerSelector';
import StatsCard from '../../components/StatsCard';
import OptimizeToggle from '../../components/OptimizeToggle';
import { PingResult } from '../../types';
import { pingService } from '../../services/pingService';
import { soundService } from '../../services/soundService';

export default function HomeScreen() {
  const [selectedServerId, setSelectedServerId] = useState('1');
  const [pingResults, setPingResults] = useState<PingResult[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    // Load sounds when component mounts
    soundService.loadSounds();
  }, []);

  const handlePingResult = (result: PingResult) => {
    setPingResults(prev => [...prev, result]);
  };

  const getLatestPing = () => {
    const latest = pingResults[pingResults.length - 1];
    return latest?.status === 'success' ? latest.latency : null;
  };

  const getAveragePing = () => {
    return pingService.getAveragePing();
  };

  const getBestServer = () => {
    const best = pingService.getBestServer();
    return best?.name || 'None';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <CustomSVGLogo size={60} />
          <Text style={styles.title}>PingBooster</Text>
          <Text style={styles.subtitle}>Optimize your connection speed</Text>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.statsContainer}>
          <StatsCard
            title="Current Ping"
            value={getLatestPing() ? `${getLatestPing()}ms` : '--'}
            subtitle={getLatestPing() && getLatestPing()! < 50 ? 'Excellent' : getLatestPing() && getLatestPing()! < 100 ? 'Good' : 'Poor'}
            trend={getLatestPing() && getLatestPing()! < 50 ? 'up' : 'down'}
            icon="ping"
            delay={0}
          />
          <StatsCard
            title="Average"
            value={getAveragePing() ? `${getAveragePing()}ms` : '--'}
            subtitle="Last 10 tests"
            icon="speed"
            delay={100}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.statsContainer}>
          <StatsCard
            title="Best Server"
            value={getBestServer()}
            subtitle="Lowest latency"
            icon="server"
            delay={200}
          />
          <StatsCard
            title="Status"
            value={isOptimizing ? "Optimized" : "Standard"}
            subtitle={isOptimizing ? "Enhanced routing" : "Default routing"}
            trend={isOptimizing ? 'up' : 'neutral'}
            delay={300}
          />
        </Animated.View>

        {/* Server Selection */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <ServerSelector
            selectedServerId={selectedServerId}
            onServerSelect={setSelectedServerId}
          />
        </Animated.View>

        {/* Ping Button */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.pingContainer}>
          <PingButton
            onPingResult={handlePingResult}
            selectedServerId={selectedServerId}
          />
        </Animated.View>

        {/* Optimization Toggle */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <OptimizeToggle
            selectedServerId={selectedServerId}
            onOptimizationChange={setIsOptimizing}
          />
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
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  pingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
});