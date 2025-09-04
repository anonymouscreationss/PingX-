import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { 
  Volume2, 
  VolumeX, 
  Bell, 
  Shield, 
  Info, 
  ChevronRight,
  Smartphone,
  Wifi,
  Settings as SettingsIcon
} from 'lucide-react-native';

import { soundService } from '../../services/soundService';

export default function SettingsScreen() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoOptimize, setAutoOptimize] = useState(false);

  const handleSoundToggle = (value: boolean) => {
    setSoundEnabled(value);
    soundService.setEnabled(value);
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement,
    delay = 0 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    delay?: number;
  }) => (
    <Animated.View entering={FadeInUp.delay(delay)}>
      <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.settingIcon}>
          {icon}
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.settingRight}>
          {rightElement || (onPress && <ChevronRight size={20} color="#C7C7CC" />)}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your ping experience</Text>
        </Animated.View>

        {/* Audio Settings */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>Audio</Text>
          
          <SettingItem
            icon={soundEnabled ? <Volume2 size={24} color="#007AFF" /> : <VolumeX size={24} color="#666" />}
            title="Sound Effects"
            subtitle="Play sounds for ping results"
            rightElement={
              <Switch
                value={soundEnabled}
                onValueChange={handleSoundToggle}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
            delay={0}
          />
        </Animated.View>

        {/* Notifications */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <SettingItem
            icon={<Bell size={24} color="#007AFF" />}
            title="Push Notifications"
            subtitle="Get notified about connection issues"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
                thumbColor="#FFFFFF"
              />
            }
            delay={100}
          />
        </Animated.View>

        {/* Optimization */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Optimization</Text>
          
          <SettingItem
            icon={<Shield size={24} color="#34C759" />}
            title="Auto Optimization"
            subtitle="Automatically optimize when ping is high"
            rightElement={
              <Switch
                value={autoOptimize}
                onValueChange={setAutoOptimize}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor="#FFFFFF"
              />
            }
            delay={200}
          />

          <SettingItem
            icon={<Wifi size={24} color="#007AFF" />}
            title="Network Preferences"
            subtitle="Configure connection settings"
            onPress={() => {}}
            delay={300}
          />
        </Animated.View>

        {/* Device Info */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Device</Text>
          
          <SettingItem
            icon={<Smartphone size={24} color="#666" />}
            title="Device Information"
            subtitle="View system and network details"
            onPress={() => {}}
            delay={400}
          />

          <SettingItem
            icon={<SettingsIcon size={24} color="#666" />}
            title="Advanced Settings"
            subtitle="Timeout, buffer size, and more"
            onPress={() => {}}
            delay={500}
          />
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInUp.delay(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <SettingItem
            icon={<Info size={24} color="#666" />}
            title="About PingBooster"
            subtitle="Version 1.0.0"
            onPress={() => {}}
            delay={600}
          />
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeInUp.delay(700)} style={styles.footer}>
          <Text style={styles.footerText}>
            PingBooster helps optimize your internet connection for better performance.
          </Text>
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingRight: {
    marginLeft: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});