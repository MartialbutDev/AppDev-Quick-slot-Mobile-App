import { SplashScreen, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { CartProvider } from './components/cart';
import { ThemeProvider } from './contexts/ThemeContext';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Simulate app initialization
    const prepareApp = async () => {
      try {
        // You can load fonts, check auth, load initial data here
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn('App initialization error:', error);
      } finally {
        setIsAppReady(true);
        SplashScreen.hideAsync();
      }
    };

    prepareApp();
  }, []);

  // Show loading screen while app is preparing
  if (!isAppReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <CartProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            // Smooth screen transitions
            animation: 'slide_from_right',
            animationDuration: 300,
            // Prevent gesture back on some screens
            gestureEnabled: true,
            // Custom header styling
            headerStyle: {
              backgroundColor: 'transparent',
            },
            headerShadowVisible: false,
          }}
        >
          {/* SPLASH SCREEN - Handles initial routing */}
          <Stack.Screen 
            name="_splash" 
            options={{
              animation: 'none',
            }}
          />
          
          {/* LOGIN */}
          <Stack.Screen 
            name="index" 
            options={{
              // Prevent going back from login
              gestureEnabled: false,
              animation: 'fade',
            }}
          />
          
          {/* SIGNUP */}
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom',
              gestureEnabled: false,
            }}
          />
          
          {/* MAIN APP - Protected by TabLayout's auth check */}
          <Stack.Screen 
            name="(tabs)" 
            options={{
              // Prevent going back to login from tabs
              gestureEnabled: false,
            }}
          />
          
          {/* ORDER MANAGEMENT */}
          <Stack.Screen name="orders/favourites" />
          <Stack.Screen name="orders/history" />
          <Stack.Screen name="orders/[id]" />
          <Stack.Screen name="orders/index" />
          
          {/* COMPONENTS */}
          <Stack.Screen name="components/cart" />
          <Stack.Screen name="components/checkout" />
          <Stack.Screen name="components/product-detail" />
          <Stack.Screen name="components/category" />
          <Stack.Screen name="components/search" />
          <Stack.Screen name="components/success" />
          <Stack.Screen name="components/favorites" />
          
          {/* PROFILE */}
          <Stack.Screen name="profile/personal-info" />
          <Stack.Screen name="profile/address" />
          <Stack.Screen name="profile/change-password" />
          
          {/* OTHER SCREENS */}
          <Stack.Screen name="notification" />
          
          {/* CATCH-ALL ROUTE FOR 404 */}
          <Stack.Screen 
            name="[...unmatched]" 
            options={{
              // This handles unmatched routes
              title: 'Not Found',
            }}
          />
        </Stack>
      </CartProvider>
    </ThemeProvider>
  );
}