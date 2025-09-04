import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Server } from '../types';
import { servers } from '../services/pingService';

interface ServerSelectorProps {
  selectedServerId: string;
  onServerSelect: (serverId: string) => void;
}

export default function ServerSelector({ selectedServerId, onServerSelect }: ServerSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Server</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {servers.map((server) => (
          <TouchableOpacity
            key={server.id}
            style={[
              styles.serverCard,
              selectedServerId === server.id && styles.selectedCard
            ]}
            onPress={() => onServerSelect(server.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.flag}>{server.flag}</Text>
            <Text style={[
              styles.serverName,
              selectedServerId === server.id && styles.selectedText
            ]}>
              {server.name}
            </Text>
            <Text style={[
              styles.location,
              selectedServerId === server.id && styles.selectedSubtext
            ]}>
              {server.location}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  serverCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    backgroundColor: '#007AFF',
    borderColor: '#005BB5',
  },
  flag: {
    fontSize: 24,
    marginBottom: 8,
  },
  serverName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  location: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  selectedSubtext: {
    color: '#E3F2FD',
  },
});