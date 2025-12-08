import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SearchResult {
  id: string;
  name: string;
  rating?: number;
  price?: string;
  type: 'user' | 'product';
}

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentKeywords, setRecentKeywords] = useState<string[]>(['Laptop', 'Camera', 'Calculate']);
  const { colors } = useTheme();

  // Mock data for suggested users
  const suggestedUsers: SearchResult[] = [
    {
      id: '1',
      name: 'Aligsao Gadgets',
      rating: 4.7,
      type: 'user'
    },
    {
      id: '2',
      name: 'Golez Gadgets',
      rating: 4.6,
      type: 'user'
    },
  ];

  // Mock data for popular products
  const popularProducts: SearchResult[] = [
    {
      id: '3',
      name: 'Acer Aspire Go 15',
      price: '₱30.00',
      type: 'product'
    },
    {
      id: '4',
      name: 'Lenovo Ideapad Slim',
      price: '₱30.00',
      type: 'product'
    },
  ];

  const filteredUsers = suggestedUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = popularProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleKeywordPress = (keyword: string) => {
    setSearchQuery(keyword);
    Keyboard.dismiss();
  };

  const handleBack = () => {
    router.back();
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderUserItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={[styles.resultItem, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      <View style={styles.userInfo}>
        <View style={[styles.userAvatar, { backgroundColor: colors.border }]}>
          <Ionicons name="person-circle-outline" size={40} color={colors.textSecondary} />
        </View>
        <View style={styles.userDetails}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={colors.rating} />
            <Text style={[styles.ratingText, { color: colors.text }]}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={[styles.resultItem, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      <View style={styles.productInfo}>
        <View style={[styles.productIcon, { backgroundColor: colors.categoryIcon }]}>
          <Ionicons name="laptop-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.productDetails}>
          <Text style={[styles.productName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.productPrice, { color: colors.primary }]}>{item.price}/hour</Text>
        </View>
      </View>
    </TouchableOpacity>
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
            placeholder="Search User"
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
        {/* Recent Keywords */}
        {searchQuery.length === 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Keywords</Text>
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

        {/* Suggested Users */}
        {(searchQuery.length === 0 || filteredUsers.length > 0) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {searchQuery.length === 0 ? 'Suggested User' : 'Search Results'}
            </Text>
            {filteredUsers.length > 0 ? (
              <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                style={styles.list}
              />
            ) : searchQuery.length > 0 ? (
              <Text style={[styles.noResults, { color: colors.textSecondary }]}>No users found</Text>
            ) : null}
          </View>
        )}

        {/* Popular Products */}
        {(searchQuery.length === 0 || filteredProducts.length > 0) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular</Text>
            {filteredProducts.length > 0 ? (
              <FlatList
                data={filteredProducts}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                style={styles.list}
              />
            ) : searchQuery.length > 0 ? (
              <Text style={[styles.noResults, { color: colors.textSecondary }]}>No products found</Text>
            ) : null}
          </View>
        )}

        {/* Show no results message */}
        {searchQuery.length > 0 && filteredUsers.length === 0 && filteredProducts.length === 0 && (
          <View style={styles.section}>
            <Text style={[styles.noResults, { color: colors.textSecondary }]}>No results found for "{searchQuery}"</Text>
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 8,
  },
});

export default SearchScreen;