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

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getFavorites();
      setFavorites(response.favorites || []);
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

  const handleProductPress = (favorite: Favorite) => {
    // Navigate to Product detail page

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

  const renderFavoriteItem = ({ item }: { item: Favorite }) => (
    <TouchableOpacity 
      style={styles.favoriteCard}
      onPress={() => handleProductPress(item)}
    >
      {/* Simple placeholder if no image available */}
      <View style={styles.imageContainer}>
        {item.productImage ? (
          <Image 
            source={{ uri: item.productImage }} 
            style={styles.productImage} 
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={32} color="#ccc" />
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.productName}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.productDescription}
        </Text>
        <Text style={styles.productPrice}>{item.productPrice}</Text>
        <Text style={styles.category}>Category: {item.category}</Text>
        <Text style={styles.addedDate}>
          Added: {new Date(item.addedAt).toLocaleDateString()}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveFavorite(item.productId, item.productName)}
      >
        <Ionicons name="heart" size={24} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No Favorites Yet</Text>
      <Text style={styles.emptyStateText}>
        Products you add to favorites will appear here
      </Text>
      <TouchableOpacity 
        style={styles.browseButton}
        onPress={() => router.back()}
      >
        <Text style={styles.browseButtonText}>Browse Products</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Favorites</Text>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerRight: {
    width: 32,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  favoriteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 2,
  },
  category: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  addedDate: {
    fontSize: 11,
    color: '#999',
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
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#007AFF',
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