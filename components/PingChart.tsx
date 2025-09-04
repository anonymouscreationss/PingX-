import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'recharts';
import { PingResult } from '../types';

interface PingChartProps {
  results: PingResult[];
}

const { width } = Dimensions.get('window');

export default function PingChart({ results }: PingChartProps) {
  const chartData = results
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

  if (chartData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Ping History</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No ping data available</Text>
          <Text style={styles.emptySubtext}>Start testing to see your ping history</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ping History</Text>
      <View style={styles.chartContainer}>
        <LineChart
          width={width - 40}
          height={200}
          data={chartData}
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="pingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#007AFF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#007AFF" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="ping"
            stroke="#007AFF"
            strokeWidth={3}
            fill="url(#pingGradient)"
            dot={{ fill: '#007AFF', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#007AFF', strokeWidth: 2 }}
          />
        </LineChart>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});