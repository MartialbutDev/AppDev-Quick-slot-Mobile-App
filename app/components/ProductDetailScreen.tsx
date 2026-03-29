import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from './cart';

interface Product {
  id: string;
  name: string;
  price: string;
  rating: number;
  reviews: number;
  description: string;
  image: any;
  specs: string[];
  owner: string;
  category: string;
}

interface Review {
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}


export default function ProductDetailScreen() {
  const params = useLocalSearchParams();
  const product = JSON.parse(params.product as string) as Product;
  const { addToCart } = useCart();
  const { colors } = useTheme();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [rentalDuration, setRentalDuration] = useState<'hours' | 'days' | 'weeks'>('hours');
  const [quantity, setQuantity] = useState(1);

  // Mock product images (in real app, you'd have multiple images)
  const productImages = [
    product.image,
    product.image, // Using Same image as placeholder
    product.image, // Using same image as placeholder
  ];

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: '1',
      user: 'John D.',
      rating: 5,
      comment: 'Great laptop! Perfect for my work, battery life is amazing.',
      date: '2024-01-15',
    },
    {
      id: '2',
      user: 'Sarah M.',
      rating: 4,
      comment: 'Good performance, but a bit heavy to carry around.',
      date: '2024-01-10',
    },
    {
      id: '3',
      user: 'Mike R.',
      rating: 5,
      comment: 'Exactly as described. Owner was very professional.',
      date: '2024-01-08',
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const calculatePrice = () => {
    const basePrice = parseFloat(product.price.replace('₱', '').replace('/hour', ''));
    let multiplier = 1;
    
    switch (rentalDuration) {
      case 'days':
        multiplier = 24; // 1 day = 24 hours
        break;
      case 'weeks':
        multiplier = 168; // 1 week = 168 hours
        break;
    }
    
    return basePrice * multiplier * quantity;
  };

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case 'hours': return 'Hourly';
      case 'days': return 'Daily';
      case 'weeks': return 'Weekly';
      default: return duration;
    }
  };

  const handleAddToCart = () => {
    const basePrice = parseFloat(product.price.replace('₱', '').replace('/hour', ''));
    const totalPrice = calculatePrice();
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      owner: product.owner,
      rentalDuration,
      quantity,
      totalPrice,
      basePrice, // Store base price for recalculations
    };

    addToCart(cartItem);
    
    Alert.alert(
      'Added to Cart',
      `${product.name} has been added to your cart!\n\nDuration: ${quantity} ${getDurationLabel(rentalDuration)}\nTotal: ₱${totalPrice.toFixed(2)}`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push('../components/cart') },
      ]
    );
  };

  const handleRentNow = () => {
    const basePrice = parseFloat(product.price.replace('₱', '').replace('/hour', ''));
    const totalPrice = calculatePrice();
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      owner: product.owner,
      rentalDuration,
      quantity,
      totalPrice,
      basePrice,
    };

    addToCart(cartItem);
    
    // Navigate directly to checkout
    router.push('../components/checkout');
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={[styles.reviewItem, { backgroundColor: colors.card }]}>
      <View style={styles.reviewHeader}>
        <Text style={[styles.reviewUser, { color: colors.text }]}>{item.user}</Text>
        <View style={styles.reviewRating}>
          <Ionicons name="star" size={16} color={colors.rating} />
          <Text style={[styles.reviewRatingText, { color: colors.text }]}>{item.rating}</Text>
        </View>
      </View>
      <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>{item.comment}</Text>
      <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>{item.date}</Text>
    </View>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Product Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }}>
        {/* Product Images */}
        <View style={styles.imageSection}>
          <Image source={productImages[selectedImageIndex]} style={styles.mainImage} />
          <FlatList
            horizontal
            data={productImages}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => setSelectedImageIndex(index)}>
                <Image 
                  source={item} 
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && [styles.selectedThumbnail, { borderColor: colors.primary }]
                  ]} 
                />
              </TouchableOpacity>
            )}
            keyExtractor={(_, index) => index.toString()}
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailsList}
          />
        </View>

        {/* Product Info */}
        <View style={[styles.productInfo, { borderBottomColor: colors.border }]}>
          <Text style={[styles.productName, { color: colors.text }]}>{product.name}</Text>
          <Text style={[styles.productDescription, { color: colors.textSecondary }]}>{product.description}</Text>
          
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons 
                  key={star}
                  name={star <= product.rating ? "star" : "star-outline"} 
                  size={20} 
                  color={colors.rating} 
                />
              ))}
            </View>
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>({product.reviews} reviews)</Text>
          </View>

          {/* Owner Info */}
          <View style={[styles.ownerInfo, { backgroundColor: colors.inputBackground }]}>
            <Ionicons name="person-circle-outline" size={40} color={colors.textSecondary} />
            <View style={styles.ownerDetails}>
              <Text style={[styles.ownerName, { color: colors.text }]}>Owner: {product.owner}</Text>
              <Text style={[styles.ownerRating, { color: colors.textSecondary }]}>⭐ 4.8 • 50+ rentals</Text>
            </View>
            <TouchableOpacity style={[styles.contactButton, { borderColor: colors.primary }]}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
              <Text style={[styles.contactButtonText, { color: colors.primary }]}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Specifications */}
        <View style={[styles.specsSection, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Specifications</Text>
          <View style={styles.specsGrid}>
            {product.specs.map((spec, index) => (
              <View key={index} style={[styles.specItem, { backgroundColor: colors.rateBadge, borderColor: colors.border }]}>
                <Text style={[styles.specText, { color: colors.primary }]}>{spec}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Rental Options */}
        <View style={[styles.rentalSection, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rental Options</Text>
          
          {/* Duration Selection */}
          <View style={styles.durationOptions}>
            <Text style={[styles.optionLabel, { color: colors.text }]}>Rental Duration:</Text>
            <View style={styles.durationButtons}>
              {[
                { key: 'hours', label: 'Hourly', price: product.price },
                { key: 'days', label: 'Daily', price: `₱${(parseFloat(product.price.replace('₱', '').replace('/hour', '')) * 24).toFixed(2)}/day` },
                { key: 'weeks', label: 'Weekly', price: `₱${(parseFloat(product.price.replace('₱', '').replace('/hour', '')) * 168).toFixed(2)}/week` },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.durationButton,
                    { backgroundColor: colors.inputBackground, borderColor: colors.border },
                    rentalDuration === option.key && [styles.selectedDurationButton, { borderColor: colors.primary, backgroundColor: colors.categoryIcon }]
                  ]}
                  onPress={() => setRentalDuration(option.key as any)}
                >
                  <Text style={[
                    styles.durationButtonText,
                    { color: colors.textSecondary },
                    rentalDuration === option.key && [styles.selectedDurationButtonText, { color: colors.primary }]
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[
                    styles.durationPrice,
                    { color: colors.textSecondary },
                    rentalDuration === option.key && [styles.selectedDurationPrice, { color: colors.primary }]
                  ]}>
                    {option.price}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quantity Selection */}
          <View style={styles.quantitySection}>
            <Text style={[styles.optionLabel, { color: colors.text }]}>Quantity:</Text>
            <View style={[styles.quantitySelector, { borderColor: colors.border }]}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={20} color={colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Total Price */}
          <View style={styles.totalSection}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
            <Text style={[styles.totalPrice, { color: colors.primary }]}>₱{calculatePrice().toFixed(2)}</Text>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Reviews</Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllReviews, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={reviews}
            renderItem={renderReviewItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={styles.reviewsList}
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionButtons, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.addToCartButton, { borderColor: colors.primary }]}
          onPress={handleAddToCart}
        >
          <Ionicons name="cart-outline" size={20} color={colors.primary} />
          <Text style={[styles.addToCartText, { color: colors.primary }]}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.rentNowButton, { backgroundColor: colors.primary }]}
          onPress={handleRentNow}
        >
          <Text style={styles.rentNowText}>Rent Now</Text>
        </TouchableOpacity>
      </View>
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
  shareButton: {
    padding: 4,
  },
  imageSection: {
    padding: 16,
  },
  mainImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 12,
  },
  thumbnailsList: {
    marginTop: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderWidth: 2,
  },
  productInfo: {
    padding: 16,
    borderBottomWidth: 1,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  ownerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ownerRating: {
    fontSize: 14,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  specsSection: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  specText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rentalSection: {
    padding: 16,
    borderBottomWidth: 1,
  },
  durationOptions: {
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderRadius: 8,
  },
  selectedDurationButton: {
    borderWidth: 1,
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedDurationButtonText: {
    fontWeight: '600',
  },
  durationPrice: {
    fontSize: 12,
  },
  selectedDurationPrice: {
    fontWeight: '600',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    padding: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  reviewsSection: {
    padding: 16,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllReviews: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewsList: {
    marginTop: 8,
  },
  reviewItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewRatingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  rentNowButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  rentNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});