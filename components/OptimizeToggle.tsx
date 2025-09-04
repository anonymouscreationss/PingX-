import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { Rocket, Shield } from 'lucide-react-native';
import { pingService, servers } from '../services/pingService';
import { soundService } from '../services/soundService';

interface OptimizeToggleProps {
  selectedServerId: string;
  onOptimizationChange: (isOptimizing: boolean) => void;
}

export default function OptimizeToggle({ selectedServerId, onOptimizationChange }: OptimizeToggleProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const togglePosition = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedToggleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: togglePosition.value }],
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });

    try {
      if (!isOptimizing) {
        // Start optimization
        const server = servers.find(s => s.id === selectedServerId) || servers[0];
        const success = await pingService.optimizeConnection(server);
        
        if (success) {
          setIsOptimizing(true);
          togglePosition.value = withSpring(28);
          runOnJS(soundService.playSound)('optimize');
          onOptimizationChange(true);
        }
      } else {
        // Stop optimization
        setIsOptimizing(false);
        togglePosition.value = withSpring(0);
        onOptimizationChange(false);
      }
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {isOptimizing ? (
            <Shield size={20} color="#34C759" />
          ) : (
            <Rocket size={20} color="#666" />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Auto Optimize</Text>
          <Text style={styles.subtitle}>
            {isOptimizing ? 'Connection optimized' : 'Tap to optimize your connection'}
          </Text>
        </View>
      </View>
      
      <Animated.View style={[animatedContainerStyle]}>
        <TouchableOpacity
          style={[styles.toggle, isOptimizing && styles.toggleActive]}
          onPress={handleToggle}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Animated.View style={[styles.toggleThumb, animatedToggleStyle]} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  toggle: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E5EA',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#34C759',
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});