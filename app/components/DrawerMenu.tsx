import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';
import * as ImagePicker from 'expo-image-picker';

interface DrawerMenuProps {
  currentUser: any;
  onClose: () => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function DrawerMenu({ 
  currentUser, 
  onClose, 
  isDarkMode = false, 
  toggleDarkMode 
}: DrawerMenuProps) {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { colors } = useTheme();

  const menuSections: MenuSection[] = [
    {
      title: 'PERSONAL INFO',
      items: [
        { icon: 'person-outline', label: 'Personal Info', route: '/profile/personal-info' },
        { icon: 'location-outline', label: 'Address', route: '/profile/address' },
      ]
    },
    {
      title: 'MY ORDERS',
      items: [
        { icon: 'cart-outline', label: 'My Orders', route: '/orders' },
        { icon: 'time-outline', label: 'Order History', route: '/orders/history' },
        { 
          icon: 'heart-outline', 
          label: 'Favourite', 
          route: '/orders/favourites',
          badge: favoritesCount > 0 ? favoritesCount.toString() : undefined
        },
        { icon: 'chatbubble-outline', label: 'Messages', route: '/messages' },
        { icon: 'card-outline', label: 'Payment Method', route: '/payment' },
      ]
    },
    {
      title: 'SUPPORT',
      items: [
        { icon: 'help-circle-outline', label: 'FAQs', route: '/faqs' },
        { icon: 'star-outline', label: 'User Reviews', route: '/reviews' },
        { icon: 'settings-outline', label: 'Settings', route: '/settings' },
      ]
    },
  ];

  // Load favorites count when menu opens
  useEffect(() => {
    loadFavoritesCount();
  }, []);

  const loadFavoritesCount = async () => {
    try {
      setLoadingFavorites(true);
      const response = await apiClient.getFavorites();
      setFavoritesCount(response.total || 0);
    } catch (error) {
      console.error('❌ Load favorites count error:', error);
    } finally {
      setLoadingFavorites(false);
    }
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
          try {
            onClose();
            
            // Clear all authentication data
            await AsyncStorage.multiRemove([
              'currentUser', 
              'authToken',
              'cartItems' // Optional: clear cart on logout
            ]);
            
            console.log('🚪 User logged out successfully');
            
            // Navigate to login screen
            router.replace('/');
            
          } catch (error) {
            console.error('❌ Logout error:', error);
            router.replace('/');
          }
        }
      }
    ]
  );
};

  const handleMenuItemPress = (route: string, label: string) => {
    onClose();
    console.log('Navigate to:', route);
    
    // Use setTimeout to ensure drawer closes before navigation
    setTimeout(() => {
      if (route) {
        // Always use push to maintain navigation stack for back button functionality
        router.push(route as any);
      }
    }, 100);
  };

  const handleDarkModeToggle = () => {
    if (toggleDarkMode) {
      toggleDarkMode();
      Alert.alert('Theme Changed', `Switched to ${isDarkMode ? 'Light' : 'Dark'} Mode`);
    }
  };

  // Load profile image when component mounts
  useEffect(() => {
    loadProfileImage();
  }, []);

  const loadProfileImage = async () => {
    try {
      const image = await AsyncStorage.getItem('profileImage');
      if (image) {
        setProfileImage(image);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please grant permission to access your photos');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    const imageUri = result.assets[0].uri;
    setProfileImage(imageUri);
    await AsyncStorage.setItem('profileImage', imageUri);
    Alert.alert('Success', 'Profile picture updated!');
  }
};

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header with User Info */}
      <View style={[styles.header, { 
        backgroundColor: colors.surface,
        borderBottomColor: colors.border
      }]}>
    <View style={styles.userInfoSection}>
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.userImage} />
          ) : (
            <View style={[styles.userImagePlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.userImageInitials}>
                {currentUser?.fullName?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.cameraIcon}>
          <Ionicons name="camera" size={14} color="#fff" />
        </View>
      </View>
      <View style={styles.userTextInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>
          {currentUser?.fullName || 'Name Surname'}
        </Text>
        <Text style={[styles.userBio, { color: colors.textSecondary }]}>
          Ready to rent some gadgets?
        </Text>
      </View>
    </View>
  </View>

      <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.menuItemsContainer, { backgroundColor: colors.surface }]}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity 
                  key={itemIndex} 
                  style={[styles.menuItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleMenuItemPress(item.route, item.label)}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.iconContainer}>
                      <Ionicons name={item.icon as any} size={20} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.menuItemText, { color: colors.text }]}>
                      {item.label}
                    </Text>
                  </View>
                  
                  <View style={styles.menuItemRight}>
                    {item.badge && (
                      <View style={[styles.badge, { backgroundColor: colors.notificationBadge }]}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Dark Mode Toggle Section */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            APPEARANCE
          </Text>
          <View style={[styles.menuItemsContainer, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={handleDarkModeToggle}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={isDarkMode ? "sunny" : "moon"} 
                    size={20} 
                    color={isDarkMode ? '#FFD700' : colors.textSecondary} 
                  />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Logout Button */}
      <View style={[styles.footer, { 
        backgroundColor: colors.surface,
        borderTopColor: colors.border
      }]}>
        <TouchableOpacity 
          style={[styles.logoutButton, { 
            backgroundColor: colors.inputBackground,
            borderColor: colors.border
          }]} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
 }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  userImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userImageInitials: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userTextInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuScroll: {
    flex: 1,
    paddingTop: 10,
  },
  menuSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItemsContainer: {
    backgroundColor: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});