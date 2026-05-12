import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';

// Backend API base URL for images
const API_BASE_URL = 'http://192.168.1.63:8000';

const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/media/')) return `${API_BASE_URL}${imagePath}`;
  return `${API_BASE_URL}/media/${imagePath}`;
};

interface Favorite {
  id: string;
  productId: string;
  productName: string;
  productPrice: string;
  productImage: string;
  productDescription: string;
  category: string;
  addedAt: string;
}

// Helper to get full gadget details from API
const fetchGadgetDetails = async (gadgetId: number) => {
  try {
    const gadgets = await apiClient.getGadgets();
    const gadget = gadgets.find((g: any) => g.id === gadgetId);
    return gadget;
  } catch (error) {
    console.error('Error fetching gadget details:', error);
    return null;
  }
};

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getFavorites();
      console.log('✅ Favorites loaded:', response);
      
      // Fetch full gadget details for each favorite to get image_url
      const enhancedFavorites = await Promise.all(
        (response.favorites || []).map(async (fav: any) => {
          const gadgetDetails = await fetchGadgetDetails(parseInt(fav.productId));
          return {
            ...fav,
            gadgetDetails,
          };
        })
      );
      
      setFavorites(enhancedFavorites);
    } catch (error: any) {
      console.error('❌ Load favorites error:', error);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleRemoveFavorite = async (productId: string, productName: string) => {
    Alert.alert(
      'Remove Favorite',
      `Are you sure you want to remove ${productName} from favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.removeFromFavorites(productId);
              setFavorites(prev => prev.filter(fav => fav.productId !== productId));
              Alert.alert('Success', 'Removed from favorites');
            } catch (error: any) {
              console.error('❌ Remove favorite error:', error);
              Alert.alert('Error', 'Failed to remove from favorites');
            }
          },
        },
      ]
    );
  };

  const handleProductPress = async (favorite: any) => {
    // Fetch full gadget details to pass to product detail
    const gadget = await fetchGadgetDetails(parseInt(favorite.productId));
    
    if (gadget) {
      const product = {
        id: gadget.id.toString(),
        name: gadget.name,
        price: `₱${gadget.daily_rate}/hour`,
        rating: 4.5,
        reviews: gadget.times_rented || 0,
        description: gadget.description,
        image: gadget.image_url ? { uri: getImageUrl(gadget.image_url) } : require('../../assets/images/Quickslot.png'),
        specs: gadget.specs || ['No specifications listed'],
        owner: gadget.brand || 'QuickSlot Partner',
        category: gadget.category_name,
        image_url: gadget.image_url,
      };
      
      router.push({
        pathname: '../components/product-detail',
        params: { product: JSON.stringify(product) }
      });
    } else {
      Alert.alert('Error', 'Product details not found');
    }
  };

  const renderFavoriteItem = ({ item }: { item: any }) => {
    const gadget = item.gadchetDetails;
    const imageSource = item.productImage 
      ? { uri: getImageUrl(item.productImage) }
      : (gadget?.image_url ? { uri: getImageUrl(gadget.image_url) } : null);
    
    const displayPrice = item.productPrice || (gadget ? `₱${gadget.daily_rate}/hour` : '₱0');
    
    return (
      <TouchableOpacity 
        style={[styles.favoriteCard, { 
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        }]}
        onPress={() => handleProductPress(item)}
      >
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image 
              source={imageSource} 
              style={styles.productImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeholderImage, { borderColor: colors.border }]}>
              <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
              <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>No Image</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: colors.text }]}>{item.productName}</Text>
          <Text style={[styles.productDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.productDescription || (gadget?.description || 'No description')}
          </Text>
          <Text style={[styles.productPrice, { color: colors.primary }]}>{displayPrice}</Text>
          <Text style={[styles.category, { color: colors.textSecondary }]}>Category: {item.category || gadget?.category_name || 'Others'}</Text>
          <Text style={[styles.addedDate, { color: colors.textSecondary }]}>
            Added: {new Date(item.addedAt).toLocaleDateString()}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(item.productId, item.productName)}
        >
          <Ionicons name="heart" size={24} color={colors.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Favorites Yet</Text>
      <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        Products you add to favorites will appear here
      </Text>
      <TouchableOpacity 
        style={[styles.browseButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(tabs)/explore')}
      >
        <Text style={styles.browseButtonText}>Browse Products</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && favorites.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { 
          backgroundColor: colors.surface,
          borderBottomColor: colors.border 
        }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Favorites</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading favorites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { 
        backgroundColor: colors.surface,
        borderBottomColor: colors.border 
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Favorites</Text>
        <TouchableOpacity onPress={loadFavorites} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        ListFooterComponent={favorites.length > 0 ? <View style={styles.footer} /> : null}
      />
    </SafeAreaView>
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
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 32,
  },
  refreshButton: {
    padding: 4,
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
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  favoriteCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  imageContainer: {
    width: 80,
    height: 80,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    marginBottom: 2,
  },
  addedDate: {
    fontSize: 11,
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    height: 20,
  },
});