import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { apiClient } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';

//Data
interface Product {
  id: string;
  name: string;
  price: string;
  rating: number;
  reviews: number;
  description: string;
  image: any;
  specs: string[];
}

export default function CategoryScreen() {
  const params = useLocalSearchParams();
  const categoryName = params.category as string;
  const categoryId = params.id as string;
  const { colors } = useTheme();

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // Mock data for different categories
  const categoryData: { [key: string]: Product[] } = {
    '1': [ // Laptops
      {
        id: '1',
        name: 'Acer Aspire Go 15',
        price: '₱30.00/hour',
        rating: 4.5,
        reviews: 89,
        description: 'Lightweight laptop perfect for students and professionals',
        image: require('../../assets/images/laptop.png'),
        specs: ['Intel Core i5', '8GB RAM', '256GB SSD', '15.6" Display']
      },
      {
        id: '2',
        name: 'Lenovo Ideapad Slim 3',
        price: '₱35.00/hour',
        rating: 4.7,
        reviews: 124,
        description: 'Sleek design with powerful performance',
        image: require('../../assets/images/lenovo.png'),
        specs: ['AMD Ryzen 5', '16GB RAM', '512GB SSD', '14" Display']
      },
      {
        id: '3',
        name: 'MacBook Pro M2',
        price: '₱80.00/hour',
        rating: 4.9,
        reviews: 256,
        description: 'Professional-grade laptop for creative work',
        image: require('../../assets/images/Macbook.png'),
        specs: ['Apple M2 Chip', '16GB RAM', '1TB SSD', '13" Retina Display']
      },
      {
        id: '4',
        name: 'Dell XPS 13',
        price: '₱45.00/hour',
        rating: 4.6,
        reviews: 167,
        description: 'Premium ultrabook with stunning display',
        image: require('../../assets/images/Dell.png'),
        specs: ['Intel Core i7', '16GB RAM', '512GB SSD', '13.4" InfinityEdge']
      }
    ],
    '2': [ // Gaming PCs
      {
        id: '5',
        name: 'Gaming PC RTX 4080',
        price: '₱120.00/hour',
        rating: 4.8,
        reviews: 78,
        description: 'High-end gaming rig for ultimate performance',
        image: require('../../assets/images/RTX.png'),
        specs: ['RTX 4080', '32GB RAM', '2TB SSD', 'Intel i9-13900K']
      },
      {
        id: '6',
        name: 'Streaming Setup Pro',
        price: '₱95.00/hour',
        rating: 4.7,
        reviews: 92,
        description: 'Perfect setup for streaming and content creation',
        image: require('../../assets/images/Stream.png'),
        specs: ['RTX 4070', '64GB RAM', '1TB SSD', 'AMD Ryzen 9']
      }
    ],
    '3': [ // Tablets
      {
        id: '7',
        name: 'iPad Air M1',
        price: '₱25.00/hour',
        rating: 4.6,
        reviews: 203,
        description: 'Versatile tablet for work and entertainment',
        image: require('../../assets/images/Ipad.png'),
        specs: ['Apple M1 Chip', '64GB Storage', '10.9" Display', '5G Support']
      },
      {
        id: '8',
        name: 'Samsung Galaxy Tab S9',
        price: '₱20.00/hour',
        rating: 4.4,
        reviews: 156,
        description: 'Android tablet with S Pen included',
        image: require('../../assets/images/Samsung.png'),
        specs: ['Snapdragon 8 Gen 2', '128GB Storage', '11" Display', 'S Pen']
      }
    ],
    '4': [ // Cameras
      {
        id: '9',
        name: 'Canon EOS R5',
        price: '₱50.00/hour',
        rating: 4.9,
        reviews: 89,
        description: 'Professional mirrorless camera for photography',
        image: require('../../assets/images/Canon.png'),
        specs: ['45MP Full Frame', '8K Video', 'IBIS', 'Dual Pixel AF']
      },
      {
        id: '10',
        name: 'Sony A7IV',
        price: '₱45.00/hour',
        rating: 4.8,
        reviews: 112,
        description: 'All-round mirrorless camera for video and photo',
        image: require('../../assets/images/Sony.png'),
        specs: ['33MP Full Frame', '4K 60p', 'Real-time Tracking', '10fps']
      }
    ],
    '5': [ // Phones
      {
        id: '11',
        name: 'iPhone 15 Pro',
        price: '₱15.00/hour',
        rating: 4.7,
        reviews: 345,
        description: 'Latest iPhone with professional features',
        image: require('../../assets/images/Iphone.png'),
        specs: ['A17 Pro Chip', '128GB Storage', '48MP Camera', 'Titanium']
      },
      {
        id: '12',
        name: 'Samsung Galaxy S24',
        price: '₱12.00/hour',
        rating: 4.5,
        reviews: 278,
        description: 'Android flagship with AI features',
        image: require('../../assets/images/Samsung1.png'),
        specs: ['Snapdragon 8 Gen 3', '256GB Storage', '200MP Camera', 'AI']
      }
    ],
    '6': [ // Accessories
      {
        id: '13',
        name: 'Wireless Keyboard & Mouse',
        price: '₱5.00/hour',
        rating: 4.3,
        reviews: 189,
        description: 'Ergonomic wireless combo set',
        image: require('../../assets/images/Wireless.png'),
        specs: ['Bluetooth 5.0', 'Rechargeable', 'Silent Keys', '2.4GHz']
      },
      {
        id: '14',
        name: 'Scientific Calculator',
        price: '₱8.00/hour',
        rating: 4.6,
        reviews: 134,
        description: 'Professional scientific calculator for students',
        image: require('../../assets/images/Scical.png'),
        specs: ['Casio fx-83GT', 'Scientific Functions', 'Battery Powered']
      }, 
      {
        id: '15',
        name: 'Sign pen Ball pen',
        price: '₱8.00/hour',
        rating: 4.6,
        reviews: 134,
        description: 'Professional Sign pen for students',
        image: require('../../assets/images/ballpen.png'),
        specs: ['Casio fx-83GT', 'Scientific ballpen', 'Good for exam']
      }
    ]
  };

  const products = categoryData[categoryId] || [];

  // Load favorites on component mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const response = await apiClient.getFavorites();
      // Fix: Explicitly type the Set as Set<string>
      const favoriteIds = new Set<string>(response.favorites?.map((fav: any) => fav.productId as string) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('❌ Load favorites error:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleProductPress = (product: Product) => {
    // Add owner and category info to product for the detail page
    const productWithDetails = {
      ...product,
      owner: getOwnerByCategory(categoryId),
      category: categoryName,
    };
    
    // Navigate to product detail page
    router.push({
      pathname: '../components/product-detail',
      params: { product: JSON.stringify(productWithDetails) }
    });
  };

  const handleToggleFavorite = async (product: Product) => {
    try {
      if (favorites.has(product.id)) {
        // Remove from favorites
        await apiClient.removeFromFavorites(product.id);
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(product.id);
          return newFavorites;
        });
        Alert.alert('Success', 'Removed from favorites');
      } else {
        // Don't store the image (require() can't be serialized)
        // We'll use the product name to map to images in favorites screen
        await apiClient.addToFavorites({
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          productImage: '', // Don't store the require() reference
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
      console.error('❌ Toggle favorite error:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  // Helper function to get owner based on category
  const getOwnerByCategory = (categoryId: string) => {
    const owners: { [key: string]: string } = {
      '1': 'Aligsao Gadgets',
      '2': 'Tech Rent PH',
      '3': 'Gadget Hub',
      '4': 'Camera Pro Rentals',
      '5': 'Phone Rentals Co.',
      '6': 'Accessory World'
    };
    return owners[categoryId] || 'QuickSlot Partner';
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={[styles.productCard, { 
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: colors.shadow,
      }]}
      onPress={() => handleProductPress(item)}
    >
      <Image source={item.image} style={styles.productImage} />
      
      {/* Favorite Button */}
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
        <Text style={[styles.productDescription, { color: colors.textSecondary }]}>{item.description}</Text>
        
        <View style={styles.specsContainer}>
          {item.specs.map((spec, index) => (
            <View key={index} style={[styles.specTag, { backgroundColor: colors.rateBadge, borderColor: colors.border }]}>
              <Text style={[styles.specText, { color: colors.primary }]}>{spec}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={colors.rating} />
          <Text style={[styles.ratingText, { color: colors.text }]}>{item.rating}</Text>
          <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>({item.reviews} reviews)</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: colors.primary }]}>{item.price}</Text>
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
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

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={80} color={colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>No products found</Text>
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
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
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
    fontSize: 16,
    marginTop: 12,
  },
});