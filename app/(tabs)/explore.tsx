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
import { apiClient } from '../api/client';
import DrawerMenu from '../components/DrawerMenu';
import SearchBar from '../components/SearchBar';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

// Type for Ionicons names
type IconName = React.ComponentProps<typeof Ionicons>['name'];

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
  // If gadget has a custom image URL from backend, use it
  if (gadget.image_url) {
    return { uri: getImageUrl(gadget.image_url) };
  }
  
  // Fallback to local images based on category
  const imageMap: { [key: string]: any } = {
    'Laptop': require('../../assets/images/laptop.png'),
    'Laptops': require('../../assets/images/laptop.png'),
    'Gaming PC': require('../../assets/images/RTX.png'),
    'Tablet': require('../../assets/images/Ipad.png'),
    'Tablets': require('../../assets/images/Ipad.png'),
    'Camera': require('../../assets/images/Canon.png'),
    'Cameras': require('../../assets/images/Canon.png'),
    'Phone': require('../../assets/images/Iphone.png'),
    'Phones': require('../../assets/images/Iphone.png'),
    'Accessory': require('../../assets/images/Wireless.png'),
    'Accessories': require('../../assets/images/Wireless.png'),
    'Projector': require('../../assets/images/Stream.png'),
    'Projectors': require('../../assets/images/Stream.png'),
    'Calculator': require('../../assets/images/Scical.png'),
    'Calculators': require('../../assets/images/Scical.png'),
  };
  return imageMap[gadget.category_name] || require('../../assets/images/Quickslot.png');
};

// Get category icon based on name
const getCategoryIcon = (categoryName: string): IconName => {
  const iconMap: Record<string, IconName> = {
    'Laptops': 'laptop-outline',
    'Tablets': 'tablet-portrait-outline',
    'Cameras': 'camera-outline',
    'Phones': 'phone-portrait-outline',
    'Projectors': 'videocam-outline',
    'Calculators': 'calculator-outline',
    'Accessories': 'hardware-chip-outline',
  };
  return iconMap[categoryName] || 'grid-outline';
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

function Homepage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-width * 0.85));
  const [notificationCount, setNotificationCount] = useState(0);
  const [mlRecommendations, setMlRecommendations] = useState<any[]>([]);
  const [loadingML, setLoadingML] = useState(false);
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [loadingGadgets, setLoadingGadgets] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [isExamWeek, setIsExamWeek] = useState(false);
  const [examWeekName, setExamWeekName] = useState<string | null>(null);
  const [popularGadgets, setPopularGadgets] = useState<Gadget[]>([]);
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
    fetchNotificationCount();
    fetchGadgets();
    fetchCategories();
    fetchMLRecommendations();
    fetchExamWeekStatus();
    fetchPopularGadgets();
  }, []);

  // Fetch exam week status from FastAPI
  const fetchExamWeekStatus = async () => {
    try {
      const response = await fetch('http://172.20.10.10:8001/api/exam-week/status');
      const data = await response.json();
      setIsExamWeek(data.is_exam_week);
      setExamWeekName(data.exam_week_name);
      console.log(`📅 Exam Week Status: ${data.is_exam_week ? 'ACTIVE - ' + data.exam_week_name : 'Not active'}`);
    } catch (error) {
      console.log('Error fetching exam week status:', error);
      setIsExamWeek(false);
    }
  };

  // Fetch popular gadgets based on actual rental count (NOT ML predictions)
  const fetchPopularGadgets = async () => {
    try {
      const allGadgets = await apiClient.getGadgets();
      // Sort by times_rented (most rented first) and take top 5
      const sorted = [...allGadgets].sort((a, b) => (b.times_rented || 0) - (a.times_rented || 0));
      setPopularGadgets(sorted.slice(0, 5));
      console.log('🔥 Popular gadgets (by rental count):', sorted.slice(0, 5).map(g => ({ name: g.name, rentals: g.times_rented })));
    } catch (error) {
      console.log('Error fetching popular gadgets:', error);
    }
  };

  // ============ FIXED: Fetch gadgets from Django API with pagination handling ============
  const fetchGadgets = async () => {
    try {
      setLoadingGadgets(true);
      const response = await apiClient.getGadgets();
      
      console.log('📦 API Response:', response);
      
      // Handle paginated response (Django REST framework returns {count, next, previous, results})
      let gadgetsList: Gadget[] = [];
      
      if (response && response.results && Array.isArray(response.results)) {
        // Paginated response
        gadgetsList = response.results;
        console.log(`📦 Found ${gadgetsList.length} gadgets (paginated)`);
      } else if (Array.isArray(response)) {
        // Non-paginated response
        gadgetsList = response;
        console.log(`📦 Found ${gadgetsList.length} gadgets (direct array)`);
      } else {
        console.error('Unexpected response format:', response);
        gadgetsList = [];
      }
      
      // Filter only available gadgets (case insensitive)
      const availableGadgets = gadgetsList.filter((g: Gadget) => 
        g.status?.toLowerCase() === 'available'
      );
      
      console.log(`✅ ${availableGadgets.length} available gadgets out of ${gadgetsList.length} total`);
      
      setGadgets(availableGadgets);
    } catch (error) {
      console.error('Error fetching gadgets:', error);
      Alert.alert('Error', 'Failed to load gadgets. Please check your connection.');
    } finally {
      setLoadingGadgets(false);
    }
  };

  // Fetch categories from Django API
  const fetchCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      console.log('📦 Categories response:', response);
      
      let categoriesList: any[] = [];
      if (response && response.results && Array.isArray(response.results)) {
        categoriesList = response.results;
      } else if (Array.isArray(response)) {
        categoriesList = response;
      } else {
        categoriesList = [
          { id: 1, name: 'Laptops' },
          { id: 2, name: 'Tablets' },
          { id: 3, name: 'Cameras' },
          { id: 4, name: 'Phones' },
          { id: 5, name: 'Projectors' },
          { id: 6, name: 'Calculators' },
        ];
      }
      setCategories(categoriesList);
    } catch (error) {
      console.log('Error fetching categories:', error);
      // Fallback categories
      setCategories([
        { id: 1, name: 'Laptops' },
        { id: 2, name: 'Tablets' },
        { id: 3, name: 'Cameras' },
        { id: 4, name: 'Phones' },
        { id: 5, name: 'Projectors' },
        { id: 6, name: 'Calculators' },
      ]);
    }
  };

  // Fetch ML recommendations from FastAPI
  const fetchMLRecommendations = async () => {
    try {
      setLoadingML(true);
      const response = await apiClient.getMLRecommendations();
      if (response && response.recommendations) {
        setMlRecommendations(response.recommendations);
      }
    } catch (error) {
      console.log('Error fetching ML recommendations:', error);
    } finally {
      setLoadingML(false);
    }
  };

  // Fetch notification count
  const fetchNotificationCount = async () => {
    try {
      const response = await apiClient.getNotifications();
      const unreadCount = response.filter((n: any) => !n.read).length;
      setNotificationCount(unreadCount);
    } catch (error) {
      console.log('Error fetching notifications:', error);
    }
  };

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

  const handleCategoryPress = (category: any) => {
    router.push({
      pathname: '../components/category',
      params: { 
        id: category.id.toString(),
        category: category.name 
      }
    });
  };

  const handleProductPress = (gadget: Gadget) => {
    const product = {
      id: gadget.id.toString(),
      name: gadget.name,
      price: `₱${gadget.daily_rate}/hour`,
      rating: 4.5,
      reviews: gadget.times_rented || 0,
      description: gadget.description,
      image: gadget.image_url ? { uri: getImageUrl(gadget.image_url) } : getGadgetImage(gadget),
      specs: gadget.specs || ['No specifications listed'],
      owner: gadget.brand || 'QuickSlot Partner',
      category: gadget.category_name,
      image_url: gadget.image_url,
    };
    
    router.push({
      pathname: '../components/product-detail',
      params: { product: JSON.stringify(product) }
    });
  };

  // Get category count
  const getCategoryCount = (categoryName: string) => {
    const count = gadgets.filter(g => g.category_name === categoryName).length;
    return `${count} available`;
  };

  // Render gadget item
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
      
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.productDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description || `${item.brand} ${item.model}`}
        </Text>
        
        <View style={styles.productMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={colors.rating} />
            <Text style={[styles.ratingText, { color: colors.text }]}>4.5</Text>
            <Text style={[styles.reviewsText, { color: colors.textSecondary }]}>({item.times_rented || 0})</Text>
          </View>
          <Text style={[styles.productCategory, { color: colors.primary }]}>{item.category_name}</Text>
        </View>
        
        <View style={styles.productFooter}>
          <Text style={[styles.productOwner, { color: colors.textSecondary }]}>{item.brand || 'QuickSlot'}</Text>
          <Text style={[styles.productPrice, { color: colors.primary }]}>₱{item.daily_rate}/hour</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render ML recommendation card (for exam week)
  const renderMLRecommendation = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.mlCard, { 
        backgroundColor: colors.surface,
        borderColor: colors.border,
        shadowColor: colors.shadow,
      }]}
      onPress={() => {
        const gadget = gadgets.find(g => 
          g.category_name?.toLowerCase() === (item.gadget_category || item.gadget_name)?.toLowerCase()
        );
        if (gadget) {
          handleProductPress(gadget);
        }
      }}
    >
      <Text style={[styles.mlCardTitle, { color: colors.text }]}>
        {item.gadget_name || item.gadget_category}
      </Text>
      <Text style={[styles.mlCardProbability, { color: colors.primary }]}>
        {Math.round((item.exam_week_probability || 0.5) * 100)}% demand
      </Text>
      {item.is_high_demand && (
        <View style={[styles.highDemandBadge, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.highDemandText, { color: colors.primary }]}>
            🔥 High Demand
          </Text>
        </View>
      )}
      <Text style={[styles.mlCardHint, { color: colors.textSecondary }]}>
        Recommended for Exam Week
      </Text>
    </TouchableOpacity>
  );

  // Render popular item card (based on actual rental count) - for normal days
  const renderPopularItem = ({ item }: { item: Gadget }) => (
    <TouchableOpacity 
      style={[styles.popularCard, { 
        backgroundColor: colors.surface,
        borderColor: colors.border,
        shadowColor: colors.shadow,
      }]}
      onPress={() => handleProductPress(item)}
    >
      <Image source={getGadgetImage(item)} style={styles.popularImage} />
      <Text style={[styles.popularTitle, { color: colors.text }]} numberOfLines={1}>
        {item.name}
      </Text>
      <View style={styles.popularStats}>
        <Text style={[styles.popularRentals, { color: colors.primary }]}>
          📈 {item.times_rented || 0} rentals
        </Text>
      </View>
      <Text style={[styles.popularPrice, { color: colors.primary }]}>
        ₱{item.daily_rate}/hour
      </Text>
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
              Hey {currentUser.fullName || currentUser.email?.split('@')[0]}, {greeting}
            </Text>
          </View>

          {/* Search Bar */}
          <SearchBar onSearchPress={handleSearchPress} />

          {/* ============ POPULAR ITEMS (Based on ACTUAL RENTALS) - Normal Days ============ */}
          {popularGadgets.length > 0 && !isExamWeek && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  🔥 Most Popular
                </Text>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  Based on {gadgets.reduce((sum, g) => sum + (g.times_rented || 0), 0)} total rentals
                </Text>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={popularGadgets}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderPopularItem}
                contentContainerStyle={styles.mlListContainer}
              />
            </View>
          )}

          {/* ============ AI PICKS (ML Predictions) - ONLY During Exam Week ============ */}
          {!loadingML && mlRecommendations.length > 0 && isExamWeek && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  🤖 AI Picks for {examWeekName || 'Exam Week'}
                </Text>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>
                  Powered by Machine Learning
                </Text>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={mlRecommendations}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderMLRecommendation}
                contentContainerStyle={styles.mlListContainer}
              />
            </View>
          )}

          {/* Categories Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>All Categories</Text>
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
                    <Ionicons name={getCategoryIcon(category.name)} size={28} color={colors.primary} />
                  </View>
                  <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
                  <Text style={[styles.categoryCount, { color: colors.textSecondary }]}>{getCategoryCount(category.name)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* All Available Items Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>All Available Items</Text>
              <Text style={[styles.itemsCount, { color: colors.textSecondary }]}>{gadgets.length} items</Text>
            </View>
            
            {loadingGadgets ? (
              <View style={styles.loadingGadgetsContainer}>
                <Text style={{ color: colors.textSecondary }}>Loading gadgets...</Text>
              </View>
            ) : (
              <FlatList
                data={gadgets}
                renderItem={renderProductItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.productsGrid}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={{ color: colors.textSecondary }}>No gadgets available at the moment</Text>
                  </View>
                }
              />
            )}
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
  loadingGadgetsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
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
  greetingSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 15,
    fontWeight: 'bold',
  },
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
    resizeMode: 'cover',
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
  mlListContainer: {
    paddingRight: 20,
  },
  mlCard: {
    width: 140,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mlCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  mlCardProbability: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  highDemandBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  highDemandText: {
    fontSize: 10,
    fontWeight: '600',
  },
  mlCardHint: {
    fontSize: 10,
  },
  // Popular card styles for normal days
  popularCard: {
    width: 140,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  popularImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  popularTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  popularStats: {
    marginBottom: 4,
  },
  popularRentals: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  popularPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Homepage;