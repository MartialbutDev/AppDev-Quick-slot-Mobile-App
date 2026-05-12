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
    const prepareApp = async () => {
      try {
        // App initialization
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

  // Show Loading screen while app is preparing
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
            animation: 'slide_from_right',
            animationDuration: 300,
            gestureEnabled: true,
          }}
        >
          {/* LOGIN - This is your index.tsx (the file you sent) */}
          <Stack.Screen 
            name="index" 
            options={{
              gestureEnabled: false,
              animation: 'fade',
            }}
          />
          
          {/* SIGNUP MODAL */}
          <Stack.Screen 
            name="modal" 
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom',
              gestureEnabled: false,
            }}
          />
          
          {/* MAIN TABS */}
          <Stack.Screen 
            name="(tabs)" 
            options={{
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
          <Stack.Screen name="payment-methods" />
          <Stack.Screen name="faqs" />
          <Stack.Screen name="reviews" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="messages" />
          <Stack.Screen name="terms" />
          <Stack.Screen name="privacy" />
          
          {/* CATCH-ALL */}
          <Stack.Screen 
            name="[...unmatched]" 
            options={{ title: 'Not Found' }}
          />
        </Stack>
      </CartProvider>
    </ThemeProvider>
  );
}