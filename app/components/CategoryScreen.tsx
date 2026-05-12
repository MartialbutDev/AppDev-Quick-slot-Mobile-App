// app/components/CategoryScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';

// Backend API base URL for images
const API_BASE_URL = 'http://172.20.10.10:8000';

// Helper function to get image URL from backend
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/media/')) return `${API_BASE_URL}${imagePath}`;
  return `${API_BASE_URL}/media/${imagePath}`;
};

// Get gadget image - uses backend uploaded image, shows placeholder if none
const getGadgetImage = (gadget: any): any => {
  if (gadget.image_url) {
    return { uri: getImageUrl(gadget.image_url) };
  }
  // Placeholder image when no image is uploaded
  return require('../../assets/images/Quickslot.png');
};

interface Gadget {
  id: number;
  name: string;
  category: number;
  category_name: string;
  brand: string;
  model: string;
  description: string;
  specs: string[];
  daily_rate: string;
  condition: string;
  status: string;
  times_rented: number;
  image_url: string | null;
}

export default function CategoryScreen() {
  const params = useLocalSearchParams();
  const categoryName = params.category as string;
  const categoryId = params.id as string;
  const { colors } = useTheme();

  const [products, setProducts] = useState<Gadget[]>([]);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  useEffect(() => {
    loadCategoryProducts();
  }, [categoryId]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadCategoryProducts = async () => {
    try {
      setLoading(true);
      const allGadgets = await apiClient.getGadgets();
      const filteredGadgets = allGadgets.filter(
        (g: Gadget) => g.category_name?.toLowerCase() === categoryName?.toLowerCase() || 
                       g.category?.toString() === categoryId
      );
      setProducts(filteredGadgets);
    } catch (error) {
      console.error('Error loading category products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const response = await apiClient.getFavorites();
      const favoriteIds = new Set<number>(
        response.favorites?.map((fav: any) => parseInt(fav.productId)) || []
      );
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleProductPress = (product: Gadget) => {
    const productWithDetails = {
      id: product.id.toString(),
      name: product.name,
      price: `₱${product.daily_rate}/hour`,
      rating: 4.5,
      reviews: product.times_rented || 0,
      description: product.description,
      image: getGadgetImage(product),
      specs: product.specs || ['No specifications listed'],
      owner: product.brand || 'QuickSlot Partner',
      category: product.category_name,
      image_url: product.image_url,
    };
    
    router.push({
      pathname: '../components/product-detail',
      params: { product: JSON.stringify(productWithDetails) }
    });
  };

  const handleToggleFavorite = async (product: Gadget) => {
    try {
      if (favorites.has(product.id)) {
        await apiClient.removeFromFavorites(product.id.toString());
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(product.id);
          return newFavorites;
        });
        Alert.alert('Success', 'Removed from favorites');
      } else {
        await apiClient.addToFavorites({
          productId: product.id.toString(),
          productName: product.name,
          productPrice: `₱${product.daily_rate}/hour`,
          productDescription: product.description,
          category: categoryName,
        });
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.add(product.id);
          return newFavorites;
        });
        Alert.alert('Success', 'Added to favorites');
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', error.message || 'Failed to update favorites');
    }
  };

  const renderProductItem = ({ item }: { item: Gadget }) => (
    <TouchableOpacity 
      style={[styles.productCard, { 
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: colors.shadow,
      }]}
      onPress={() => handleProductPress(item)}
    >
      <Image source={getGadgetImage(item)} style={styles.productImage} />
      
      <TouchableOpacity 
        style={[styles.favoriteButton, { backgroundColor: colors.surface }]}
        onPress={() => handleToggleFavorite(item)}
        disabled={loadingFavorites}
      >
        <Ionicons 
          name={favorites.has(item.id) ? "heart" : "heart-outline"} 
          size={24} 
          color={favorites.has(item.id) ? colors.error : colors.textSecondary} 
        />
      </TouchableOpacity>
      
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.productDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description || `${item.brand} ${item.model}`}
        </Text>
        
        {item.specs && item.specs.length > 0 && (
          <View style={styles.specsContainer}>
            {item.specs.slice(0, 3).map((spec, index) => (
              <View key={index} style={[styles.specTag, { backgroundColor: colors.rateBadge, borderColor: colors.border }]}>
                <Text style={[styles.specText, { color: colors.primary }]} numberOfLines={1}>
                  {spec}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={colors.rating} />
          <Text style={[styles.ratingText, { color: colors.text }]}>4.5</Text>
          <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>({item.times_rented || 0} rentals)</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.primary }]}>₱{item.daily_rate}/hour</Text>
          <TouchableOpacity 
            style={[styles.rentButton, { backgroundColor: colors.primary }]}
            onPress={() => handleProductPress(item)}
          >
            <Text style={styles.rentButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { 
          backgroundColor: colors.surface,
          borderBottomColor: colors.border 
        }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{categoryName}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading {categoryName}...</Text>
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
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{categoryName}</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>No products found</Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              No gadgets available in {categoryName} at the moment
            </Text>
          </View>
        }
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
  },
  productCard: {
    borderRadius: 12,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 20,
    padding: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  specsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  specTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 6,
    borderWidth: 1,
  },
  specText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 8,
  },
  reviewsText: {
    fontSize: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rentButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  rentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});