import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
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

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  // Function to map product names to local images
  const getProductImage = (favorite: Favorite) => {
    const imageMap: { [key: string]: any } = {
      'acer aspire go 15': require('../../assets/images/laptop.png'),
      'lenovo ideapad slim 3': require('../../assets/images/lenovo.png'),
      'macbook pro m2': require('../../assets/images/Macbook.png'),
      'dell xps 13': require('../../assets/images/Dell.png'),
      'gaming pc rtx 4080': require('../../assets/images/RTX.png'),
      'streaming setup pro': require('../../assets/images/Stream.png'),
      'ipad air m1': require('../../assets/images/Ipad.png'),
      'samsung galaxy tab s9': require('../../assets/images/Samsung.png'),
      'canon eos r5': require('../../assets/images/Canon.png'),
      'sony a7iv': require('../../assets/images/Sony.png'),
      'iphone 15 pro': require('../../assets/images/Iphone.png'),
      'samsung galaxy s24': require('../../assets/images/Samsung1.png'),
      'wireless keyboard & mouse': require('../../assets/images/Wireless.png'),
      'scientific calculator': require('../../assets/images/Scical.png'),
      'sign pen ball pen': require('../../assets/images/ballpen.png'),
    };
    
    const imageKey = favorite.productName.toLowerCase();
    return imageMap[imageKey] || null;
  };

  const loadFavorites = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading favorites...');
      const response = await apiClient.getFavorites();
      console.log('✅ Favorites loaded:', response);
      setFavorites(response.favorites || []);
    } catch (error: any) {
      console.error('❌ Load favorites error:', error);
      
      // More specific error handling
      if (error.message?.includes('Order not found')) {
        console.error('⚠️ Wrong endpoint called - should be favorites, not orders');
        Alert.alert('Error', 'Failed to load favorites - configuration error');
      } else {
        Alert.alert('Error', 'Failed to load favorites. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('🎯 Favorites screen mounted');
    loadFavorites();
    return () => {
      console.log('🎯 Favorites screen unmounted');
    };
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

  const handleProductPress = (favorite: Favorite) => {
    // Navigate to product detail page
    router.push({
      pathname: '../components/product-detail',
      params: { 
        product: JSON.stringify({
          id: favorite.productId,
          name: favorite.productName,
          price: favorite.productPrice,
          description: favorite.productDescription,
          image: favorite.productImage,
          category: favorite.category,
        })
      }
    });
  };
  

  const renderFavoriteItem = ({ item }: { item: Favorite }) => {
    const imageSource = getProductImage(item);
    
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
            {item.productDescription}
          </Text>
          <Text style={[styles.productPrice, { color: colors.primary }]}>{item.productPrice}</Text>
          <Text style={[styles.category, { color: colors.textSecondary }]}>Category: {item.category}</Text>
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
        onPress={() => router.back()}
      >
        <Text style={styles.browseButtonText}>Browse Products</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
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

      {/* Favorites List */}
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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