// app/services/notificationService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

// Get your computer's IP address (same as your Django backend)
// Run `ipconfig` in terminal to find your IPv4 address
const API_BASE_URL = 'http://192.168.1.62:8000'; // ← UPDATE THIS TO YOUR IP

// Configure notification handler (how notifications appear)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,      // Show alert popup
    shouldPlaySound: true,      // Play sound
    shouldSetBadge: true,       // Update app badge count
  }),
});

// Register for push notifications (call this when app starts)
export async function registerForPushNotifications() {
  try {
    let token;
    
    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Push notification permission denied');
      Alert.alert('Permission Required', 'Please enable notifications to receive updates about your rentals.');
      return null;
    }
    
    // Get Expo push token
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id', // Optional: add your Expo project ID
    })).data;
    
    console.log('✅ Push token obtained:', token);
    
    // Save token to backend
    await saveTokenToBackend(token);
    
    return token;
    
  } catch (error) {
    console.error('❌ Error registering for push notifications:', error);
    return null;
  }
}

// Save token to Django backend
async function saveTokenToBackend(token) {
  try {
    const userJson = await AsyncStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson);
      const authToken = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/api/users/update-push-token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ 
          expo_push_token: token 
        }),
      });
      
      if (response.ok) {
        console.log('✅ Push token saved to backend');
      } else {
        console.log('❌ Failed to save push token');
      }
    }
  } catch (error) {
    console.error('❌ Error saving token to backend:', error);
  }
}

// Listen for notifications when app is in foreground
export function setupNotificationListener() {
  // When notification is received while app is open
  const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('📱 Notification received while app open:', notification);
    
    // You can show an in-app alert here
    Alert.alert(
      notification.request.content.title || 'QuickSlot',
      notification.request.content.body || 'You have a new notification',
    );
  });
  
  // When user taps on notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('🔔 User tapped notification:', response);
    
    // Navigate to relevant screen based on notification data
    const data = response.notification.request.content.data;
    if (data?.screen) {
      // Navigate to that screen (you'll need navigation reference)
      // navigation.navigate(data.screen, data.params);
    }
  });
  
  return {
    receivedSubscription,
    responseSubscription,
  };
}

// Send test notification (for debugging)
export async function sendTestNotification() {
  const token = await registerForPushNotifications();
  if (token) {
    Alert.alert('Success', `Push token: ${token.substring(0, 20)}...`);
  }
}

// Handle notifications when app is in background/closed
export function setNotificationCategory() {
  // Define notification categories (for actions like "Mark as Read")
  Notifications.setNotificationCategoryAsync('rental', [
    {
      identifier: 'view',
      buttonTitle: 'View Rental',
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: 'dismiss',
      buttonTitle: 'Dismiss',
      options: {
        opensAppToForeground: false,
      },
    },
  ]);
}