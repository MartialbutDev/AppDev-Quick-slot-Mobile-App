import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';

interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function AddressScreen() {
  const router = useRouter();
  const [address, setAddress] = useState<AddressData>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Philippines',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    loadAddress();
  }, []);

  const loadAddress = async () => {
    try {
      setLoading(true);
      // Try to get address from backend
      const response = await apiClient.getUserAddress();
      if (response && response.address) {
        setAddress(response.address);
      }
    } catch (error) {
      console.log('No saved address found, using defaults');
      // Set default country for Philippines
      setAddress(prev => ({ ...prev, country: 'Philippines' }));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!address.street.trim()) {
      Alert.alert('Error', 'Please enter your street address');
      return;
    }
    if (!address.city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return;
    }
    if (!address.zipCode.trim()) {
      Alert.alert('Error', 'Please enter your ZIP code');
      return;
    }

    setSaving(true);
    try {
      await apiClient.updateUserAddress(address);
      Alert.alert('Success', 'Address updated successfully!');
      router.back();
    } catch (error: any) {
      console.error('Error saving address:', error);
      Alert.alert('Error', error.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading address...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Manage Address</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveText, { color: colors.primary, opacity: saving ? 0.5 : 1 }]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Street Address *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={address.street}
            onChangeText={(text) => setAddress({...address, street: text})}
            placeholder="Enter street address"
            placeholderTextColor={colors.placeholder}
          />
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.halfInput]}>
            <Text style={[styles.label, { color: colors.text }]}>City *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={address.city}
              onChangeText={(text) => setAddress({...address, city: text})}
              placeholder="Enter city"
              placeholderTextColor={colors.placeholder}
            />
          </View>

          <View style={[styles.inputGroup, styles.halfInput]}>
            <Text style={[styles.label, { color: colors.text }]}>State/Province</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={address.state}
              onChangeText={(text) => setAddress({...address, state: text})}
              placeholder="Enter state"
              placeholderTextColor={colors.placeholder}
            />
          </View>
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.inputGroup, styles.halfInput]}>
            <Text style={[styles.label, { color: colors.text }]}>ZIP Code *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={address.zipCode}
              onChangeText={(text) => setAddress({...address, zipCode: text})}
              placeholder="Enter ZIP code"
              placeholderTextColor={colors.placeholder}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfInput]}>
            <Text style={[styles.label, { color: colors.text }]}>Country</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={address.country}
              onChangeText={(text) => setAddress({...address, country: text})}
              placeholder="Enter country"
              placeholderTextColor={colors.placeholder}
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Your address will be used for delivery and meetup locations.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  form: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  infoBox: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});