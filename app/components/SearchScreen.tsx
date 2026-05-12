import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

// Get gadget image - prioritizes backend uploaded image, falls back to local
const getGadgetImage = (gadget: any): any => {
  if (gadget.image_url) {
    return { uri: getImageUrl(gadget.image_url) };
  }
  // Fallback to local images based on category
  const imageMap: { [key: string]: any } = {
    'Laptop': require('../../assets/images/laptop.png'),
    'Laptops': require('../../assets/images/laptop.png'),
    'Tablet': require('../../assets/images/Ipad.png'),
    'Camera': require('../../assets/images/Canon.png'),
    'Phone': require('../../assets/images/Iphone.png'),
    'Projector': require('../../assets/images/Stream.png'),
    'Calculator': require('../../assets/images/Scical.png'),
  };
  return imageMap[gadget.category_name] || require('../../assets/images/Quickslot.png');
};

interface Gadget {
  id: number;
  name: string;
  category_name: string;
  brand: string;
  model: string;
  description: string;
  daily_rate: string;
  status: string;
  times_rented: number;
  image_url: string | null;
}

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentKeywords, setRecentKeywords] = useState<string[]>(['Laptop', 'Camera', 'Tablet', 'Phone', 'Projector']);
  const { colors } = useTheme();

  // Search gadgets from API
  const searchGadgets = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const allGadgets = await apiClient.getGadgets();
      const filtered = allGadgets.filter((gadget: Gadget) => 
        gadget.name.toLowerCase().includes(query.toLowerCase()) ||
        gadget.brand?.toLowerCase().includes(query.toLowerCase()) ||
        gadget.category_name?.toLowerCase().includes(query.toLowerCase()) ||
        gadget.description?.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    searchGadgets(text);
  };

  const handleKeywordPress = (keyword: string) => {
    setSearchQuery(keyword);
    searchGadgets(keyword);
    Keyboard.dismiss();
    
    // Save to recent keywords (avoid duplicates)
    setRecentKeywords(prev => {
      const filtered = prev.filter(k => k !== keyword);
      return [keyword, ...filtered].slice(0, 5);
    });
  };

  const handleBack = () => {
    router.back();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleProductPress = (gadget: Gadget) => {
    const product = {
      id: gadget.id.toString(),
      name: gadget.name,
      price: `₱${gadget.daily_rate}/hour`,
      rating: 4.5,
      reviews: gadget.times_rented || 0,
      description: gadget.description,
      image: getGadgetImage(gadget),
      specs: ['No specifications listed'],
      owner: gadget.brand || 'QuickSlot Partner',
      category: gadget.category_name,
      image_url: gadget.image_url,
    };
    
    router.push({
      pathname: '../components/product-detail',
      params: { product: JSON.stringify(product) }
    });
  };

  const renderProductItem = ({ item }: { item: Gadget }) => (
    <TouchableOpacity 
      style={[styles.resultItem, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
      onPress={() => handleProductPress(item)}
    >
      <Image source={getGadgetImage(item)} style={styles.productImage} />
      <View style={styles.productInfo}>
        <View style={styles.productDetails}>
          <Text style={[styles.productName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.productCategory, { color: colors.textSecondary }]}>{item.category_name}</Text>
          <Text style={[styles.productPrice, { color: colors.primary }]}>₱{item.daily_rate}/hour</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={colors.rating} />
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>{item.times_rented || 0} rentals</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Try searching for different keywords
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View style={[styles.searchHeader, { 
        backgroundColor: colors.surface,
        borderBottomColor: colors.border 
      }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.inputBackground }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search laptops, cameras, tablets..."
            placeholderTextColor={colors.placeholder}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Recent Keywords - Show only when no search query */}
        {searchQuery.length === 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Searches</Text>
            <View style={styles.keywordsContainer}>
              {recentKeywords.map((keyword, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.keywordTag, { 
                    backgroundColor: colors.surface,
                    borderColor: colors.border 
                  }]}
                  onPress={() => handleKeywordPress(keyword)}
                >
                  <Text style={[styles.keywordText, { color: colors.text }]}>{keyword}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Search Results */}
        {searchQuery.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Results for "{searchQuery}"
            </Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                style={styles.list}
              />
            ) : (
              renderEmptyState()
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keywordTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  keywordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    marginTop: 8,
  },
  resultItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f5f5f5',
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 13,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SearchScreen;