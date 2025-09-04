import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { TrendingUp, TrendingDown, Zap, Server } from 'lucide-react-native';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: 'ping' | 'server' | 'speed';
  delay?: number;
}

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  trend = 'neutral', 
  icon = 'ping',
  delay = 0 
}: StatsCardProps) {
  const getIcon = () => {
    const iconProps = { size: 24, color: '#007AFF' };
    switch (icon) {
      case 'server':
        return <Server {...iconProps} />;
      case 'speed':
        return <Zap {...iconProps} />;
      default:
        return <Zap {...iconProps} />;
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={16} color="#34C759" />;
    if (trend === 'down') return <TrendingDown size={16} color="#FF3B30" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return '#34C759';
    if (trend === 'down') return '#FF3B30';
    return '#666';
  };

  return (
    <Animated.View 
      entering={FadeInUp.delay(delay).springify()}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        {getTrendIcon() && (
          <View style={styles.trendContainer}>
            {getTrendIcon()}
          </View>
        )}
      </View>
      
      {subtitle && (
        <Text style={[styles.subtitle, { color: getTrendColor() }]}>
          {subtitle}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flex: 1,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    flex: 1,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
  },
  trendContainer: {
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
});