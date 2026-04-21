import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    orderAlerts: true,
    lowStockAlerts: true,
    darkMode: false,
    biometricAuth: false,
    autoSync: true,
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const settingSections = [
    {
      title: 'Notifications',
      items: [
        {
          key: 'pushNotifications',
          title: 'Push Notifications',
          subtitle: 'Receive push notifications on your device',
          type: 'switch',
        },
        {
          key: 'emailNotifications',
          title: 'Email Notifications',
          subtitle: 'Receive notifications via email',
          type: 'switch',
        },
        {
          key: 'orderAlerts',
          title: 'Order Alerts',
          subtitle: 'Get notified about new orders',
          type: 'switch',
        },
        {
          key: 'lowStockAlerts',
          title: 'Low Stock Alerts',
          subtitle: 'Get notified when inventory is low',
          type: 'switch',
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          key: 'darkMode',
          title: 'Dark Mode',
          subtitle: 'Use dark theme throughout the app',
          type: 'switch',
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          key: 'biometricAuth',
          title: 'Biometric Authentication',
          subtitle: 'Use fingerprint or face ID to unlock',
          type: 'switch',
        },
        {
          title: 'Change Password',
          subtitle: 'Update your account password',
          type: 'action',
          onPress: () => Alert.alert('Change Password', 'This feature will be available soon.'),
        },
      ],
    },
    {
      title: 'Data & Sync',
      items: [
        {
          key: 'autoSync',
          title: 'Auto Sync',
          subtitle: 'Automatically sync data in background',
          type: 'switch',
        },
        {
          title: 'Clear Cache',
          subtitle: 'Clear app cache and temporary files',
          type: 'action',
          onPress: () => Alert.alert(
            'Clear Cache',
            'Are you sure you want to clear the app cache?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', onPress: () => Alert.alert('Success', 'Cache cleared successfully') },
            ]
          ),
        },
      ],
    },
  ];

  const renderSettingItem = (item, sectionIndex, itemIndex) => {
    if (item.type === 'switch') {
      return (
        <View key={`${sectionIndex}-${itemIndex}`} style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
          <Switch
            value={settings[item.key]}
            onValueChange={(value) => handleSettingChange(item.key, value)}
            trackColor={{ false: '#e2e8f0', true: '#667eea' }}
            thumbColor={settings[item.key] ? '#ffffff' : '#f4f4f5'}
          />
        </View>
      );
    }

    if (item.type === 'action') {
      return (
        <TouchableOpacity
          key={`${sectionIndex}-${itemIndex}`}
          style={styles.settingItem}
          onPress={item.onPress}
        >
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#a0aec0" />
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1a202c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) =>
                renderSettingItem(item, sectionIndex, itemIndex)
              )}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>App Version</Text>
                <Text style={styles.settingSubtitle}>1.0.0</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('Terms of Service', 'Terms of service content will be displayed here.')}
            >
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Terms of Service</Text>
                <Text style={styles.settingSubtitle}>View terms and conditions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#a0aec0" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => Alert.alert('Privacy Policy', 'Privacy policy content will be displayed here.')}
            >
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Privacy Policy</Text>
                <Text style={styles.settingSubtitle}>View privacy policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#a0aec0" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a202c',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 10,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: 'white',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f7fafc',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#718096',
  },
});

export default SettingsScreen;
