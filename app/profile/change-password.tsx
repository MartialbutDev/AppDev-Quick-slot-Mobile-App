import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { apiClient } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useTheme();

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = formData;

    console.log('🔐 Password change attempt:', {
      currentPassword: currentPassword ? '***' : 'empty',
      newPassword: newPassword ? '***' : 'empty',
      confirmPassword: confirmPassword ? '***' : 'empty'
    });

    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      console.log('📡 Calling API to change password...');
      
      // ACTUALLY call the backend API
      const response = await apiClient.changePassword({
        currentPassword,
        newPassword,
      });

      console.log('✅ Password change API response:', response);
      
      Alert.alert('Success', 'Password changed successfully!');
      router.back();
      
    } catch (error: any) {
      console.error('❌ Password change error:', error);
      console.log('Error details:', error.message);
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Change Password</Text>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={formData.currentPassword}
            onChangeText={(text) => setFormData({...formData, currentPassword: text})}
            placeholder="Enter current password"
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={formData.newPassword}
            onChangeText={(text) => setFormData({...formData, newPassword: text})}
            placeholder="Enter new password (min. 6 characters)"
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
            placeholder="Confirm new password"
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled, { backgroundColor: colors.primary }]} 
          onPress={handleChangePassword}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Changing Password...' : 'Change Password'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});