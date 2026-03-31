import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs, useGlobalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function TabLayout() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { colors } = useTheme();

  // Function to Check authentication status
  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('🔐 Starting auth check...');
      
      const [currentUser, authToken] = await Promise.all([
        AsyncStorage.getItem('currentUser'),
        AsyncStorage.getItem('authToken'),
      ]);
      
      console.log('🔐 Auth check results:', {
        hasUser: !!currentUser,
        hasToken: !!authToken,
        tokenLength: authToken?.length || 0
      });
      
      const authenticated = !!(currentUser && authToken);
      setIsAuthenticated(authenticated);
      
      return authenticated;
    } catch (error: any) {
      console.error('❌ Auth check error:', error);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Validate token on app start and focus
  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      if (!mounted) return;
      
      // Initial auth check
      const isAuth = await checkAuth();
      
      if (!isAuth && mounted) {
        console.log('🚪 User not authenticated, redirecting to login...');
        // Clear any stale data
        await AsyncStorage.multiRemove(['currentUser', 'authToken']);
      }
    };

    initializeAuth();

    // Listen for app state changes (when app comes to foreground)
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active' && mounted) {
        console.log('🔄 App became active, checking auth...');
        await checkAuth();
      }
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  // Listen for logout parameter changes
  useEffect(() => {
    const handleLogout = async () => {
      if (params.logout === 'true') {
        console.log('🚪 Logout detected, clearing auth...');
        await AsyncStorage.multiRemove(['currentUser', 'authToken']);
        setIsAuthenticated(false);
        // Remove logout param to prevent infinite loop
        router.setParams({ logout: undefined as any });
      }
    };
    
    handleLogout();
  }, [params.logout]);

  // Show loading state
  if (isLoading || isAuthenticated === null) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <View style={styles.loadingTextContainer}>
          <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Verifying session...
          </Text>
        </View>
      </View>
    );
  }

  // Don't show tabs on login screen
  if (!isAuthenticated) {
    console.log('👤 User not authenticated, hiding tabs');
    return (
      <Tabs
        screenOptions={{
          tabBarStyle: {
            display: 'none',
          },
          headerShown: false,
          animation: 'none',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Login',
            headerLeft: () => null,
          }}
        />
        {/* Hide all other screens when not authenticated */}
        <Tabs.Screen name="explore" options={{ href: null }} />
        <Tabs.Screen name="search" options={{ href: null }} />
        <Tabs.Screen name="rent-out" options={{ href: null }} />
        <Tabs.Screen name="history" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        {/* REMOVE messages and settings from here - they're not needed in unauthenticated state */}
      </Tabs>
    );
  }

  // Show full tab bar when authenticated - ONLY 5 TABS
  console.log('✅ User authenticated, showing tabs');
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: colors.shadow,
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        headerShown: false,
        animation: 'shift',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      {/* Hide index tab */}
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      
      {/* TAB 1: HOME */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* TAB 2: SEARCH */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "search" : "search-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* TAB 3: RENT OUT BUTTON */}
      <Tabs.Screen
        name="rent-out"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={[
              styles.rentButton, 
              { 
                backgroundColor: colors.primary,
                transform: [{ scale: focused ? 1.1 : 1 }]
              }
            ]}>
              <Ionicons name="add" size={28} color="#fff" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      
      {/* TAB 4: HISTORY */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "time" : "time-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* TAB 5: PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* MESSAGES - NOT in tab bar, but accessible via navigation */}
      <Tabs.Screen
        name="messages"
        options={{
          href: null,  // This hides it from tab bar
        }}
      />
      
      {/* SETTINGS - NOT in tab bar, but accessible via navigation */}
      <Tabs.Screen
        name="settings"
        options={{
          href: null,  // This hides it from tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconContainerActive: {
    // You can add active state styling here
  },
  rentButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    transitionProperty: 'transform',
    transitionDuration: '200ms',
  },
});