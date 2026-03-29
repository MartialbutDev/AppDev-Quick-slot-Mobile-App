import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import { useTheme } from './contexts/ThemeContext';

// Use the centralized API client
import { apiClient } from './api/client';

export default function SignupModal() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { colors } = useTheme();

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Student ID validation
    if (!formData.studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    } else if (formData.studentId.trim().length < 3) {
      newErrors.studentId = 'Student ID must be at least 3 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form.');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🎯 Signup attempt for:', formData.email);
      
      // Call the centralized API client
      const response = await apiClient.signup({
        fullName: formData.fullName.trim(),
        studentId: formData.studentId.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // Save user data and token
      await AsyncStorage.setItem('currentUser', JSON.stringify(response.user));
      await AsyncStorage.setItem('authToken', response.token);
      

      console.log('✅ Signup successful:', response.user.fullName);
      
      // Show success message with options
      Alert.alert(
        'Welcome to QuickSlot!', 
        `Account created successfully! Welcome, ${response.user.fullName}!`,
        [
          {
            text: 'Get Started',
            onPress: () => {
              router.replace('/(tabs)/explore');
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      
      // Handle specific error cases
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.message.includes('already exists')) {
        errorMessage = 'An account with this email or student ID already exists. Please try logging in instead.';
      } else if (error.message.includes('network') || error.message.includes('connect')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.message.includes('password') || error.message.includes('6 characters')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (isLoading) {
      Alert.alert(
        'Cancel Signup?',
        'Are you sure you want to cancel? Your information will be lost.',
        [
          { text: 'Continue Signup', style: 'cancel' },
          { text: 'Cancel', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  const clearError = (field: string) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <>
<Stack.Screen 
  options={{ 
    title: 'Create Account',
    headerLeft: () => (
      <TouchableOpacity onPress={handleBack} style={styles.closeButtonContainer}>
        <Text style={[styles.closeButton, { color: colors.primary }]}>
          Cancel
        </Text>
      </TouchableOpacity>
    ),
    headerStyle: {
      backgroundColor: colors.surface,
    },
    headerTitleStyle: {
      fontWeight: 'bold',
      color: colors.text,
      fontSize: 18,
    },
    headerTintColor: colors.text,
    presentation: 'modal',
    animation: 'slide_from_bottom',
  }} 
/>
      
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Join QuickSlot
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Create your account to start renting gadgets
          </Text>
        </View>

        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Full Name *
            </Text>
            <TextInput
              style={[
                styles.input, 
                errors.fullName && styles.inputError,
                { 
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.fullName ? colors.error : colors.border,
                  color: colors.text 
                }
              ]}
              value={formData.fullName}
              onChangeText={(text) => {
                setFormData({ ...formData, fullName: text });
                clearError('fullName');
              }}
              placeholder="Enter your full name"
              placeholderTextColor={colors.placeholder}
              autoComplete="name"
              autoCapitalize="words"
              returnKeyType="next"
              editable={!isLoading}
            />
            {errors.fullName && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.fullName}
              </Text>
            )}
          </View>

          {/* Student ID */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Student ID *
            </Text>
            <TextInput
              style={[
                styles.input, 
                errors.studentId && styles.inputError,
                { 
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.studentId ? colors.error : colors.border,
                  color: colors.text 
                }
              ]}
              value={formData.studentId}
              onChangeText={(text) => {
                setFormData({ ...formData, studentId: text });
                clearError('studentId');
              }}
              placeholder="Enter your student ID"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              autoComplete="username"
              returnKeyType="next"
              editable={!isLoading}
            />
            {errors.studentId && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.studentId}
              </Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Email Address *
            </Text>
            <TextInput
              style={[
                styles.input, 
                errors.email && styles.inputError,
                { 
                  backgroundColor: colors.inputBackground,
                  borderColor: errors.email ? colors.error : colors.border,
                  color: colors.text 
                }
              ]}
              value={formData.email}
              onChangeText={(text) => {
                setFormData({ ...formData, email: text });
                clearError('email');
              }}
              placeholder="Enter your email"
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              editable={!isLoading}
            />
            {errors.email && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.email}
              </Text>
            )}
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Password *
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input, 
                  styles.passwordInput,
                  errors.password && styles.inputError,
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.password ? colors.error : colors.border,
                    color: colors.text 
                  }
                ]}
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({ ...formData, password: text });
                  clearError('password');
                }}
                placeholder="Create a strong password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                returnKeyType="next"
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={styles.showPasswordButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Text style={[styles.showPasswordText, { color: colors.primary }]}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.password}
              </Text>
            ) : (
              <Text style={[styles.hintText, { color: colors.textSecondary }]}>
                • At least 6 characters
                {'\n'}• At least one uppercase letter
                {'\n'}• At least one number
              </Text>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Confirm Password *
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input, 
                  styles.passwordInput,
                  errors.confirmPassword && styles.inputError,
                  { 
                    backgroundColor: colors.inputBackground,
                    borderColor: errors.confirmPassword ? colors.error : colors.border,
                    color: colors.text 
                  }
                ]}
                value={formData.confirmPassword}
                onChangeText={(text) => {
                  setFormData({ ...formData, confirmPassword: text });
                  clearError('confirmPassword');
                }}
                placeholder="Confirm your password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showConfirmPassword}
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleSignup}
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={styles.showPasswordButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <Text style={[styles.showPasswordText, { color: colors.primary }]}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          {/* Signup Button */}
          <TouchableOpacity 
            style={[
              styles.signupButton, 
              isLoading && styles.signupButtonDisabled,
              { backgroundColor: colors.primary }
            ]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.signupButtonText}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            By creating an account, you agree to our{' '}
            <Text style={[styles.termsLink, { color: colors.primary }]}>
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text style={[styles.termsLink, { color: colors.primary }]}>
              Privacy Policy
            </Text>
          </Text>

          {/* Login Prompt */}
          <View style={styles.loginPrompt}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.back()} disabled={isLoading}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  closeButtonContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  form: {
    padding: 24,
    paddingTop: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  hintText: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 70,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 12,
    top: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  showPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  signupButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 24,
  },
  termsLink: {
    fontWeight: '600',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});