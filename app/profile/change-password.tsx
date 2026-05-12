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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { colors } = useTheme();

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = formData;

    // Validation
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
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

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setIsLoading(true);

    try {
      console.log('📡 Calling API to change password...');
      
      const response = await apiClient.changePassword({
        currentPassword,
        newPassword,
      });

      console.log('✅ Password change API response:', response);
      
      Alert.alert(
        'Success', 
        'Password changed successfully! Please login again with your new password.',
        [
          { 
            text: 'OK', 
            onPress: async () => {
              // Logout user after password change
              await apiClient.logout();
              router.replace('/');
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error('❌ Password change error:', error);
      
      let errorMessage = 'Failed to change password. Please try again.';
      if (error.message.includes('current password is incorrect')) {
        errorMessage = 'Current password is incorrect. Please try again.';
      } else if (error.message.includes('must be at least 6 characters')) {
        errorMessage = 'New password must be at least 6 characters long.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Change Password</Text>
        <TouchableOpacity onPress={handleChangePassword} disabled={isLoading}>
          <Text style={[styles.saveText, { color: colors.primary, opacity: isLoading ? 0.5 : 1 }]}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.form}>
        {/* Current Password */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, { 
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={formData.currentPassword}
              onChangeText={(text) => setFormData({...formData, currentPassword: text})}
              placeholder="Enter current password"
              placeholderTextColor={colors.placeholder}
              secureTextEntry={!showCurrentPassword}
              editable={!isLoading}
            />
            <TouchableOpacity 
              style={styles.showButton}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Text style={[styles.showText, { color: colors.primary }]}>
                {showCurrentPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, { 
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={formData.newPassword}
              onChangeText={(text) => setFormData({...formData, newPassword: text})}
              placeholder="Enter new password (min. 6 characters)"
              placeholderTextColor={colors.placeholder}
              secureTextEntry={!showNewPassword}
              editable={!isLoading}
            />
            <TouchableOpacity 
              style={styles.showButton}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Text style={[styles.showText, { color: colors.primary }]}>
                {showNewPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>
            Password must be at least 6 characters
          </Text>
        </View>

        {/* Confirm Password */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, { 
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
              placeholder="Confirm new password"
              placeholderTextColor={colors.placeholder}
              secureTextEntry={!showConfirmPassword}
              editable={!isLoading}
            />
            <TouchableOpacity 
              style={styles.showButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={[styles.showText, { color: colors.primary }]}>
                {showConfirmPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 60,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  showButton: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  showText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hintText: {
    fontSize: 12,
    marginTop: 4,
  },
});