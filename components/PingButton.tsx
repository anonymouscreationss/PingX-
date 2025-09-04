import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { Zap, Wifi } from 'lucide-react-native';
import { pingService, servers } from '../services/pingService';
import { soundService } from '../services/soundService';
import { PingResult } from '../types';

interface PingButtonProps {
  onPingResult: (result: PingResult) => void;
  selectedServerId: string;
}

export default function PingButton({ onPingResult, selectedServerId }: PingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lastPing, setLastPing] = useState<number | null>(null);
  
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePing = async () => {
    if (isLoading) return;

    setIsLoading(true);
    
    // Start animations
    scale.value = withSequence(
      withSpring(0.95),
      withSpring(1.05),
      withSpring(1)
    );
    
    rotation.value = withTiming(360, { duration: 1000 });
    glowOpacity.value = withTiming(1, { duration: 200 });

    try {
      const server = servers.find(s => s.id === selectedServerId) || servers[0];
      const result = await pingService.measurePing(server);
      
      setLastPing(result.latency);
      onPingResult(result);
      
      // Play sound based on result
      if (result.status === 'success') {
        runOnJS(soundService.playSound)('success');
      } else {
        runOnJS(soundService.playSound)('fail');
      }
      
    } catch (error) {
      console.error('Ping failed:', error);
      runOnJS(soundService.playSound)('fail');
    } finally {
      setIsLoading(false);
      rotation.value = withTiming(0, { duration: 500 });
      glowOpacity.value = withTiming(0, { duration: 500 });
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glowContainer, glowStyle]}>
        <View style={styles.glow} />
      </Animated.View>
      
      <Animated.View style={[animatedStyle]}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonLoading]}
          onPress={handlePing}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            {isLoading ? (
              <Wifi size={32} color="#FFFFFF" />
            ) : (
              <Zap size={32} color="#FFFFFF" />
            )}
          </View>
          
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : 'Test Ping'}
          </Text>
          
          {lastPing && !isLoading && (
            <Text style={styles.pingResult}>
              {lastPing}ms
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    backgroundColor: '#007AFF',
    opacity: 0.3,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  button: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonLoading: {
    backgroundColor: '#5AC8FA',
  },
  iconContainer: {
    marginBottom: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  pingResult: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    opacity: 0.9,
  },
});