import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// Use the centralized API client instead of inline
import { apiClient } from '../api/client';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    checkExistingSession();
    loadRememberedCredentials();
  }, []);

  const loadRememberedCredentials = async () => {
    try {
      const remembered = await AsyncStorage.getItem('rememberedCredentials');
      if (remembered) {
        const { username: savedUsername } = JSON.parse(remembered);
        setUsername(savedUsername);
        setRememberMe(true);
      }
    } catch (error) {
      console.log('❌ Error loading remembered credentials:', error);
    }
  };

  const checkExistingSession = async () => {
    try {
      const currentUser = await AsyncStorage.getItem('currentUser');
      const authToken = await AsyncStorage.getItem('authToken');
      
      if (currentUser && authToken) {
        console.log('🔄 User already logged in, redirecting...');
        // Small delay to show splash screen
        setTimeout(() => {
          router.replace('/(tabs)/explore');
        }, 500);
      }
    } catch (error) {
      console.error('❌ Session check error:', error);
    }
  };

  const handleLogin = async () => {
    // Validate inputs
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter your email or student ID');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🎯 Login button pressed');
      
      // Validate email format if it looks like an email
      if (username.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(username)) {
          throw new Error('Please enter a valid email address');
        }
      }

      // Call the centralized API client
      const response = await apiClient.login({ username, password });
      
      // Save user session
      await AsyncStorage.setItem('currentUser', JSON.stringify(response.user));
      await AsyncStorage.setItem('authToken', response.token);
      
      // Remember credentials if selected
      if (rememberMe) {
        await AsyncStorage.setItem('rememberedCredentials', JSON.stringify({
          username,
          // Note: Never store passwords in plain text
        }));
      } else {
        await AsyncStorage.removeItem('rememberedCredentials');
      }
      
      console.log('✅ Login successful:', response.user.fullName);
      
      // Navigate without alert to avoid double alerts
      router.replace('/(tabs)/explore');
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // User-friendly error messages
      let errorMessage = 'Invalid credentials. Please try again.';
      
      if (error.message.includes('Invalid email/student ID or password')) {
        errorMessage = 'The email/student ID or password you entered is incorrect.';
      } else if (error.message.includes('User not found')) {
        errorMessage = 'No account found with this email/student ID. Please sign up.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.message.includes('valid email')) {
        errorMessage = error.message;
      } else {
        errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'A password reset link will be sent to your email.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Reset Link', 
          onPress: () => {
            // Implement password reset logic here
            Alert.alert('Check Your Email', 'If an account exists with this email, you will receive a password reset link.');
          }
        }
      ]
    );
  };

  const handleGuestLogin = () => {
    Alert.alert(
      'Continue as Guest',
      'You can browse products as a guest, but you\'ll need to create an account to rent items.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue as Guest', 
          onPress: () => {
            // Set guest mode flag
            AsyncStorage.setItem('isGuest', 'true');
            router.replace('/(tabs)/explore');
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <Image 
          source={require('../../assets/images/Quickslot.png')} 
          style={styles.logo} 
        />
        <Text style={styles.title}>QuickSlot</Text>
        <Text style={styles.subtitle}> Rentals Made Easy</Text>
      </View>
      
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>EMAIL OR STUDENT ID</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your email or student ID"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => {
              // Focus password input
              // You'll need to use refs for this in real implementation
            }}
          />
          
          <Text style={[styles.label, { color: colors.text }]}>PASSWORD</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput, { 
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text 
              }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.placeholder}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity 
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={[styles.showPasswordText, { color: colors.primary }]}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[
                styles.checkbox,
                { borderColor: colors.primary },
                rememberMe && { backgroundColor: colors.primary }
              ]}>
                {rememberMe && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={[styles.rememberMeText, { color: colors.text }]}>
                Remember me
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[
              styles.loginButton, 
              isLoading && styles.loginButtonDisabled,
              { backgroundColor: colors.primary }
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'LOGGING IN...' : 'LOG IN'}
            </Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, { color: colors.textSecondary }]}>
              Don't have an account?{' '}
              <Link href="/modal" asChild>
                <TouchableOpacity>
                  <Text style={[styles.signupLink, { color: colors.primary }]}>
                    SIGN UP
                  </Text>
                </TouchableOpacity>
              </Link>
            </Text>
          </View>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
              Or continue with
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <TouchableOpacity 
            style={[styles.guestButton, { borderColor: colors.border }]}
            onPress={handleGuestLogin}
          >
            <Text style={[styles.guestButtonText, { color: colors.text }]}>
              Continue as Guest
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  header: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  form: {
    marginBottom: 30,
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
    marginBottom: 16,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  passwordInput: {
    paddingRight: 70, // Space for show password button
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberMeText: {
    fontSize: 14,
  },
  forgotPasswordContainer: {
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  signupContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  guestButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});