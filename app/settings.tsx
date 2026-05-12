import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from './contexts/ThemeContext';

// Define types for menu items
type MenuItem = {
  icon: string;
  label: string;
  onPress?: () => void;
  type?: 'switch' | 'info';
  value?: boolean | string;
  onToggle?: (value: boolean) => void;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

export default function SettingsScreen() {
  const { colors, isDarkMode, toggleDarkMode } = useTheme();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [biometricLogin, setBiometricLogin] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove(['currentUser', 'authToken', 'rememberedCredentials']);
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear temporary data. Your account information will remain safe.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => Alert.alert('Success', 'Cache cleared successfully!') },
      ]
    );
  };

  const settingsSections: MenuSection[] = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Personal Information', onPress: () => router.push('/profile/personal-info') },
        { icon: 'card-outline', label: 'Payment Methods', onPress: () => router.push('/payment-methods') },
        { icon: 'location-outline', label: 'Address', onPress: () => router.push('/profile/address') },
        { icon: 'lock-closed-outline', label: 'Change Password', onPress: () => router.push('/profile/change-password') },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: 'moon-outline', label: 'Dark Mode', type: 'switch', value: isDarkMode, onToggle: toggleDarkMode },
        { icon: 'notifications-outline', label: 'Push Notifications', type: 'switch', value: pushNotifications, onToggle: setPushNotifications },
        { icon: 'mail-outline', label: 'Email Notifications', type: 'switch', value: emailNotifications, onToggle: setEmailNotifications },
        { icon: 'finger-print-outline', label: 'Biometric Login', type: 'switch', value: biometricLogin, onToggle: setBiometricLogin },
      ],
    },
    {
      title: 'Security & Privacy',
      items: [
        { icon: 'shield-outline', label: 'Privacy Policy', onPress: () => Alert.alert('Privacy Policy', 'QuickSlot values your privacy...') },
        { icon: 'document-text-outline', label: 'Terms & Conditions', onPress: () => Alert.alert('Terms & Conditions', 'QuickSlot Terms of Service...') },
        { icon: 'trash-outline', label: 'Clear Cache', onPress: handleClearCache },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'FAQs', onPress: () => router.push('/faqs') },
        { icon: 'chatbubble-outline', label: 'Contact Support', onPress: () => router.push('/messages') },
        { icon: 'star-outline', label: 'Rate Us', onPress: () => Alert.alert('Rate Us', 'Thank you for supporting QuickSlot!') },
      ],
    },
    {
      title: 'About',
      items: [
        { icon: 'information-circle-outline', label: 'App Version', type: 'info', value: 'QuickSlot v2.0.0' },
        { icon: 'build-outline', label: 'Build Number', type: 'info', value: 'Build #2026.04.01' },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 && styles.lastItem,
                    { borderBottomColor: colors.border }
                  ]}
                  onPress={item.onPress}
                  disabled={item.type === 'switch'}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons name={item.icon as any} size={24} color={colors.primary} />
                    <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                  </View>
                  {item.type === 'switch' ? (
                    <Switch
                      value={item.value as boolean}
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#fff"
                    />
                  ) : item.type === 'info' ? (
                    <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{item.value as string}</Text>
                  ) : (
                    <Ionicons name="chevron-forward-outline" size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error + '10' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            QuickSlot Rental System
          </Text>
          <Text style={[styles.footerSubtext, { color: colors.textSecondary }]}>
            © 2026 QuickSlot. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  lastItem: { borderBottomWidth: 0 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingLabel: { fontSize: 16 },
  infoValue: { fontSize: 14 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 32,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutText: { fontSize: 16, fontWeight: '600' },
  footer: { alignItems: 'center', padding: 32, paddingBottom: 40 },
  footerText: { fontSize: 14, marginBottom: 4 },
  footerSubtext: { fontSize: 12 },
});