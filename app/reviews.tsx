import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from './contexts/ThemeContext';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
  gadgetName?: string;
}

export default function ReviewsScreen() {
  const { colors } = useTheme();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [showWriteReview, setShowWriteReview] = useState(false);

  const reviews: Review[] = [
    {
      id: '1',
      userName: 'John D.',
      rating: 5,
      comment: 'Great laptop! Perfect for my online classes. Battery life is amazing and the owner was very responsive.',
      date: '2 days ago',
      avatar: 'JD',
      gadgetName: 'MacBook Pro M2',
    },
    {
      id: '2',
      userName: 'Sarah M.',
      rating: 4,
      comment: 'Good experience overall. The camera was in excellent condition. Would rent again.',
      date: '1 week ago',
      avatar: 'SM',
      gadgetName: 'Canon EOS R5',
    },
    {
      id: '3',
      userName: 'Mike R.',
      rating: 5,
      comment: 'Exactly as described. The owner was very professional and on time for meetup.',
      date: '2 weeks ago',
      avatar: 'MR',
      gadgetName: 'iPad Air M1',
    },
    {
      id: '4',
      userName: 'Anna L.',
      rating: 3,
      comment: 'The laptop worked fine but had some scratches not mentioned in the description.',
      date: '3 weeks ago',
      avatar: 'AL',
      gadgetName: 'Acer Aspire Go 15',
    },
    {
      id: '5',
      userName: 'Chris T.',
      rating: 5,
      comment: 'Best rental experience! Will definitely use QuickSlot again.',
      date: '1 month ago',
      avatar: 'CT',
      gadgetName: 'iPhone 15 Pro',
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const submitReview = () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    if (!reviewText.trim()) {
      Alert.alert('Error', 'Please write your review');
      return;
    }
    
    Alert.alert('Thank You!', 'Your review has been submitted for approval.');
    setRating(0);
    setReviewText('');
    setShowWriteReview(false);
  };

  const renderStars = (ratingValue: number, interactive = false, onPress?: (rate: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && onPress && onPress(star)}
            disabled={!interactive}
          >
            <Ionicons
              name={star <= ratingValue ? 'star' : 'star-outline'}
              size={interactive ? 32 : 16}
              color={star <= ratingValue ? '#FFD700' : colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.reviewHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>{item.avatar}</Text>
        </View>
        <View style={styles.reviewInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.userName}</Text>
          {item.gadgetName && (
            <Text style={[styles.gadgetName, { color: colors.textSecondary }]}>
              Rented: {item.gadgetName}
            </Text>
          )}
          <View style={styles.reviewMeta}>
            {renderStars(item.rating)}
            <Text style={[styles.date, { color: colors.textSecondary }]}>{item.date}</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.comment, { color: colors.textSecondary }]}>{item.comment}</Text>
    </View>
  );

  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: (reviews.filter(r => r.rating === star).length / reviews.length) * 100,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Reviews & Ratings</Text>
        <TouchableOpacity onPress={() => setShowWriteReview(!showWriteReview)}>
          <Ionicons name="create-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Section */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.summaryLeft}>
            <Text style={[styles.averageRating, { color: colors.text }]}>{averageRating}</Text>
            <View style={styles.summaryStars}>
              {renderStars(Math.round(parseFloat(averageRating)))}
            </View>
            <Text style={[styles.totalReviews, { color: colors.textSecondary }]}>
              Based on {reviews.length} reviews
            </Text>
          </View>
          <View style={styles.summaryRight}>
            {ratingDistribution.map((item) => (
              <View key={item.star} style={styles.distributionRow}>
                <Text style={[styles.distributionStar, { color: colors.textSecondary }]}>{item.star}</Text>
                <Ionicons name="star" size={14} color="#FFD700" />
                <View style={[styles.distributionBar, { backgroundColor: colors.border }]}>
                  <View 
                    style={[styles.distributionFill, { width: `${item.percentage}%`, backgroundColor: colors.primary }]} 
                  />
                </View>
                <Text style={[styles.distributionCount, { color: colors.textSecondary }]}>({item.count})</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Write Review Section */}
        {showWriteReview && (
          <View style={[styles.writeReviewSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Write a Review</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Share your experience with the gadget and owner
            </Text>
            {renderStars(rating, true, setRating)}
            <TextInput
              style={[styles.reviewInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
              placeholder="Write your review here..."
              placeholderTextColor={colors.textSecondary}
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.writeReviewButtons}>
              <TouchableOpacity 
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setShowWriteReview(false)}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={submitReview}
              >
                <Text style={styles.submitButtonText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Reviews List */}
        <View style={styles.reviewsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>User Reviews</Text>
          <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>{reviews.length} reviews</Text>
        </View>

        <FlatList
          data={reviews}
          renderItem={renderReview}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16 },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 20,
  },
  summaryLeft: { flex: 1, alignItems: 'center' },
  averageRating: { fontSize: 48, fontWeight: 'bold' },
  summaryStars: { marginVertical: 8 },
  totalReviews: { fontSize: 12 },
  summaryRight: { flex: 1 },
  distributionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  distributionStar: { fontSize: 12, fontWeight: 'bold', width: 20 },
  distributionBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  distributionFill: { height: '100%', borderRadius: 3 },
  distributionCount: { fontSize: 11, width: 35 },
  writeReviewSection: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  sectionSubtitle: { fontSize: 13, marginBottom: 16 },
  starsContainer: { flexDirection: 'row', gap: 8, marginVertical: 16, justifyContent: 'center' },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginVertical: 16,
    textAlignVertical: 'top',
  },
  writeReviewButtons: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  cancelButtonText: { fontSize: 14, fontWeight: '600' },
  submitButton: { flex: 2, padding: 12, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  reviewCount: { fontSize: 14 },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: { flexDirection: 'row', marginBottom: 12, gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: 'bold' },
  reviewInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  gadgetName: { fontSize: 12, marginBottom: 4 },
  reviewMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { fontSize: 12 },
  comment: { fontSize: 14, lineHeight: 20 },
});