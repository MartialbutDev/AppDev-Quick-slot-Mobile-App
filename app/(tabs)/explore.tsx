import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DrawerMenu from '../components/DrawerMenu';
import SearchBar from '../components/SearchBar';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

// Mock data for all products
const allProducts = [
  {
    id: '1',
    name: 'Acer Aspire Go 15',
    price: '₱30.00/hour',
    rating: 4.5,
    reviews: 89,
    description: 'Lightweight laptop perfect for students and professionals',
    image: require('../../assets/images/laptop.png'),
    specs: ['Intel Core i5', '8GB RAM', '256GB SSD', '15.6" Display'],
    owner: 'Aligsao Gadgets',
    category: 'Laptops'
  },
  {
    id: '2',
    name: 'Lenovo Ideapad Slim 3',
    price: '₱35.00/hour',
    rating: 4.7,
    reviews: 124,
    description: 'Sleek design with powerful performance',
    image: require('../../assets/images/lenovo.png'),
    specs: ['AMD Ryzen 5', '16GB RAM', '512GB SSD', '14" Display'],
    owner: 'Tech Rent PH',
    category: 'Laptops'
  },
  {
    id: '3',
    name: 'MacBook Pro M2',
    price: '₱80.00/hour',
    rating: 4.9,
    reviews: 256,
    description: 'Professional-grade laptop for creative work',
    image: require('../../assets/images/Macbook.png'),
    specs: ['Apple M2 Chip', '16GB RAM', '1TB SSD', '13" Retina Display'],
    owner: 'Gadget Hub',
    category: 'Laptops'
  },
  {
    id: '4',
    name: 'Dell XPS 13',
    price: '₱45.00/hour',
    rating: 4.6,
    reviews: 167,
    description: 'Premium ultrabook with stunning display',
    image: require('../../assets/images/Dell.png'),
    specs: ['Intel Core i7', '16GB RAM', '512GB SSD', '13.4" InfinityEdge'],
    owner: 'Aligsao Gadgets',
    category: 'Laptops'
  },
  {
    id: '5',
    name: 'Gaming PC RTX 4080',
    price: '₱120.00/hour',
    rating: 4.8,
    reviews: 78,
    description: 'High-end gaming rig for ultimate performance',
    image: require('../../assets/images/RTX.png'),
    specs: ['RTX 4080', '32GB RAM', '2TB SSD', 'Intel i9-13900K'],
    owner: 'Tech Rent PH',
    category: 'Gaming PCs'
  },
  {
    id: '6',
    name: 'Streaming Setup Pro',
    price: '₱95.00/hour',
    rating: 4.7,
    reviews: 92,
    description: 'Perfect setup for streaming and content creation',
    image: require('../../assets/images/Stream.png'),
    specs: ['RTX 4070', '64GB RAM', '1TB SSD', 'AMD Ryzen 9'],
    owner: 'Gadget Hub',
    category: 'Gaming PCs'
  },
  {
    id: '7',
    name: 'iPad Air M1',
    price: '₱25.00/hour',
    rating: 4.6,
    reviews: 203,
    description: 'Versatile tablet for work and entertainment',
    image: require('../../assets/images/Ipad.png'),
    specs: ['Apple M1 Chip', '64GB Storage', '10.9" Display', '5G Support'],
    owner: 'Aligsao Gadgets',
    category: 'Tablets'
  },
  {
    id: '8',
    name: 'Samsung Galaxy Tab S9',
    price: '₱20.00/hour',
    rating: 4.4,
    reviews: 156,
    description: 'Android tablet with S Pen included',
    image: require('../../assets/images/Samsung.png'),
    specs: ['Snapdragon 8 Gen 2', '128GB Storage', '11" Display', 'S Pen'],
    owner: 'Tech Rent PH',
    category: 'Tablets'
  },
  {
    id: '9',
    name: 'Canon EOS R5',
    price: '₱50.00/hour',
    rating: 4.9,
    reviews: 89,
    description: 'Professional mirrorless camera for photography',
    image: require('../../assets/images/Canon.png'),
    specs: ['45MP Full Frame', '8K Video', 'IBIS', 'Dual Pixel AF'],
    owner: 'Camera Pro Rentals',
    category: 'Cameras'
  },
  {
    id: '10',
    name: 'Sony A7IV',
    price: '₱45.00/hour',
    rating: 4.8,
    reviews: 112,
    description: 'All-round mirrorless camera for video and photo',
    image: require('../../assets/images/Sony.png'),
    specs: ['33MP Full Frame', '4K 60p', 'Real-time Tracking', '10fps'],
    owner: 'Camera Pro Rentals',
    category: 'Cameras'
  },
  {
    id: '11',
    name: 'iPhone 15 Pro',
    price: '₱15.00/hour',
    rating: 4.7,
    reviews: 345,
    description: 'Latest iPhone with professional features',
    image: require('../../assets/images/Iphone.png'),
    specs: ['A17 Pro Chip', '128GB Storage', '48MP Camera', 'Titanium'],
    owner: 'Phone Rentals Co.',
    category: 'Phones'
  },
  {
    id: '12',
    name: 'Samsung Galaxy S24',
    price: '₱12.00/hour',
    rating: 4.5,
    reviews: 278,
    description: 'Android flagship with AI features',
    image: require('../../assets/images/Samsung1.png'),
    specs: ['Snapdragon 8 Gen 3', '256GB Storage', '200MP Camera', 'AI'],
    owner: 'Phone Rentals Co.',
    category: 'Phones'
  },
  {
    id: '13',
    name: 'Wireless Keyboard & Mouse',
    price: '₱5.00/hour',
    rating: 4.3,
    reviews: 189,
    description: 'Ergonomic wireless combo set',
    image: require('../../assets/images/Wireless.png'),
    specs: ['Bluetooth 5.0', 'Rechargeable', 'Silent Keys', '2.4GHz'],
    owner: 'Accessory World',
    category: 'Accessories'
  },
  {
    id: '14',
    name: 'Scientific Calculator',
    price: '₱8.00/hour',
    rating: 4.6,
    reviews: 134,
    description: 'Professional scientific calculator for students',
    image: require('../../assets/images/Scical.png'),
    specs: ['Casio fx-83GT', 'Scientific Functions', 'Battery Powered'],
    owner: 'Accessory World',
    category: 'Accessories'
  },
  {
    id: '15',
    name: 'Sign pen Ball pen',
    price: '₱8.00/hour',
    rating: 4.6,
    reviews: 134,
    description: 'Professional Sign pen for students',
    image: require('../../assets/images/ballpen.png'),
    specs: ['Casio fx-83GT', 'Scientific ballpen', 'Good for exam'],
    owner: 'Accessory World',
    category: 'Accessories'
  }
];

export default function Homepage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width * 0.85));
  const [notificationCount, setNotificationCount] = useState(3);
  const { colors, isDarkMode, toggleDarkMode } = useTheme();

  const currentTime = new Date().getHours();
  let greeting = 'Good Morning';
  
  if (currentTime >= 12 && currentTime < 18) {
    greeting = 'Good Afternoon';
  } else if (currentTime >= 18) {
    greeting = 'Good Evening';
  }

  useEffect(() => {
    checkAuthentication();
  }, []);

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: -width * 0.85,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setDrawerVisible(false);
    });
  };

  const checkAuthentication = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (!userData) {
        Alert.alert('Session Expired', 'Please login again.');
        router.replace('/');
        return;
      }
      setCurrentUser(JSON.parse(userData));
    } catch (error) {
      console.log('Auth check error:', error);
      router.replace('/');
    }
  };

  const handleSearchPress = () => {
    router.push('../components/search');
  };

  const handleNotificationPress = () => {
    router.push('/notification');
  };

  const handleCategoryPress = (category: { id: string; name: string }) => {
    router.push({
      pathname: '../components/category',
      params: { 
        id: category.id,
        category: category.name 
      }
    });
  };

  const handleProductPress = (product: any) => {
    router.push({
      pathname: '../components/product-detail',
      params: { product: JSON.stringify(product) }
    });
  };

  // Categories for gadget types
  const categories = [
    { id: '1', name: 'Laptops', icon: 'laptop-outline', count: '24 available' },
    { id: '2', name: 'Gaming PCs', icon: 'desktop-outline', count: '18 available' },
    { id: '3', name: 'Tablets', icon: 'tablet-portrait-outline', count: '32 available' },
    { id: '4', name: 'Cameras', icon: 'camera-outline', count: '15 available' },
    { id: '5', name: 'Phones', icon: 'phone-portrait-outline', count: '45 available' },
    { id: '6', name: 'Accessories', icon: 'hardware-chip-outline', count: '67 available' },
  ];

  // Render product item for the all items section
  const renderProductItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.productCard, { 
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: colors.shadow,
      }]}
      onPress={() => handleProductPress(item)}
    >
      <Image source={item.image} style={styles.productImage} />
      
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.productDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.productMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={colors.rating} />
            <Text style={[styles.ratingText, { color: colors.text }]}>{item.rating}</Text>
            <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>({item.reviews})</Text>
          </View>
          <Text style={[styles.productCategory, { color: colors.primary }]}>{item.category}</Text>
        </View>
        
        <View style={styles.productFooter}>
          <Text style={[styles.productOwner, { color: colors.textSecondary }]}>{item.owner}</Text>
          <Text style={[styles.productPrice, { color: colors.primary }]}>{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!currentUser) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Drawer Modal Overlay */}
      <Modal
        visible={drawerVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.drawerContent,
              {
                transform: [{ translateX: slideAnim }],
                backgroundColor: colors.surface,
              }
            ]}
          >
          <DrawerMenu 
            currentUser={currentUser} 
            onClose={closeDrawer}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />
          </Animated.View>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closeDrawer}
          />
        </View>
      </Modal>

      {/* Main Content */}
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Header with Logo and Notification */}
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={openDrawer}
            >
              <Ionicons name="menu-outline" size={28} color={colors.text} />
            </TouchableOpacity>
            
            {/* QuickSlot Logo */}
            <Image 
              source={require('../../assets/images/Quickslot.png')} 
              style={styles.logo}
            />
            
            {/* Notification Button */}
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={handleNotificationPress}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              {notificationCount > 0 && (
                <View style={[styles.notificationBadge, { backgroundColor: colors.notificationBadge }]}>
                  <Text style={styles.notificationCount}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Greeting Section */}
          <View style={styles.greetingSection}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Hey {currentUser.fullName || currentUser.email}, {greeting}
            </Text>
          </View>

          {/* Search Bar */}
          <SearchBar onSearchPress={handleSearchPress} />

          {/* Categories Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>All Categories</Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See All &gt;</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <TouchableOpacity 
                  key={category.id} 
                  style={[styles.categoryCard, { 
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    shadowColor: colors.shadow,
                  }]}
                  onPress={() => handleCategoryPress(category)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: colors.categoryIcon }]}>
                    <Ionicons name={category.icon as any} size={28} color={colors.primary} />
                  </View>
                  <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                  <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>{category.count}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* All Available Items Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>All Available Items</Text>
              <Text style={[styles.itemsCount, { color: colors.textSecondary }]}>{allProducts.length} items</Text>
            </View>
            
            <FlatList
              data={allProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.productsGrid}
            />
          </View>

          {/* Add proper bottom padding to account for tab bar */}
          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal Overlay Styles
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerContent: {
    width: width * 0.85,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginLeft: width * 0.85,
  },
  // Header with Logo and  Notification
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  menuButton: {
    padding: 8,
  },
  logo: {
    width: 100,
    height: 70,
    resizeMode: 'contain',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Greeting Section
  greetingSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  // Sections
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemsCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    textAlign: 'center',
  },
  // Products Grid
  productsGrid: {
    paddingBottom: 8,
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
    lineHeight: 20,
    marginBottom: 12,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  productCategory: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productOwner: {
    fontSize: 14,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpace: {
    height: 100,
  },
});