import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from './contexts/ThemeContext';

export default function ReviewsScreen() {
  const { colors } = useTheme();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const reviews = [
    {
      id: '1',
      userName: 'John Doe',
      rating: 5,
      comment: 'Great app! Very easy to use and the items are in good condition.',
      date: '2 days ago',
      avatar: 'JD',
    },
    {
      id: '2',
      userName: 'Jane Smith',
      rating: 4,
      comment: 'Good experience overall. Customer service was helpful.',
      date: '1 week ago',
      avatar: 'JS',
    },
    {
      id: '3',
      userName: 'Mike Johnson',
      rating: 5,
      comment: 'Quick delivery and great communication. Highly recommend!',
      date: '2 weeks ago',
      avatar: 'MJ',
    },
  ];

  const renderStars = (rating: number, interactive = false, onPress?: (rate: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && onPress && onPress(star)}
            disabled={!interactive}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={interactive ? 32 : 16}
              color={star <= rating ? '#FFD700' : colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const submitReview = () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    if (!reviewText.trim()) {
      alert('Please write your review');
      return;
    }
    
    alert('Thank you for your review!');
    setRating(0);
    setReviewText('');
  };

  const renderReview = ({ item }: any) => (
    <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.reviewHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>{item.avatar}</Text>
        </View>
        <View style={styles.reviewInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.userName}</Text>
          <View style={styles.reviewMeta}>
            {renderStars(item.rating)}
            <Text style={[styles.date, { color: colors.textSecondary }]}>{item.date}</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.comment, { color: colors.textSecondary }]}>{item.comment}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Reviews & Ratings</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <>
            {/* Write Review Section */}
            <View style={[styles.writeReviewSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Write a Review</Text>
              {renderStars(rating, true, setRating)}
              <TextInput
                style={[styles.reviewInput, { backgroundColor: colors.inputBackground, borderColor: colors.border, color: colors.text }]}
                placeholder="Share your experience..."
                placeholderTextColor={colors.textSecondary}
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={submitReview}>
                <Text style={styles.submitButtonText}>Submit Review</Text>
              </TouchableOpacity>
            </View>

            {/* Reviews header */}
            <View style={styles.reviewsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>User Reviews</Text>
              <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>{reviews.length} reviews</Text>
            </View>
          </>
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16 },
  writeReviewSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  starsContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 16,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewCount: { fontSize: 14 },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: { flexDirection: 'row', marginBottom: 12, gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: 'bold' },
  reviewInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  reviewMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { fontSize: 12 },
  comment: { fontSize: 14, lineHeight: 20 },
});