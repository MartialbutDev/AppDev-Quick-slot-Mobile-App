import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from './contexts/ThemeContext';

export default function FAQsScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: 'How do I rent an item?',
      answer: 'Browse items on the home page, select an item, choose rental duration, and click "Rent Now". Follow the checkout process to complete your rental.',
    },
    {
      id: 2,
      question: 'What payment methods are accepted?',
      answer: 'We accept credit cards, debit cards, GCash, and PayMaya. You can add your preferred payment method in the Settings section.',
    },
    {
      id: 3,
      question: 'How do I track my orders?',
      answer: 'Go to the History tab to see all your orders. You can track the status of each order from pending to completed.',
    },
    {
      id: 4,
      question: 'What is the rental duration?',
      answer: 'Rental durations vary by item. You can choose from daily, weekly, or monthly rentals depending on the item owner\'s settings.',
    },
    {
      id: 5,
      question: 'How do I contact the item owner?',
      answer: 'Use the Messages feature to chat with item owners. You can start a conversation from the item detail page.',
    },
    {
      id: 6,
      question: 'Can I cancel my order?',
      answer: 'Yes, you can cancel orders that are still in "pending" status. Go to your order history and select "Cancel Order".',
    },
    {
      id: 7,
      question: 'How do I become a renter?',
      answer: 'Click the "+" button in the middle of the bottom navigation to list your items for rent. Fill in the item details and set your rental price.',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {faqs.map(faq => (
          <View key={faq.id} style={[styles.faqCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.questionContainer}
              onPress={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
            >
              <Text style={[styles.question, { color: colors.text }]}>{faq.question}</Text>
              <Ionicons
                name={expandedId === faq.id ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            {expandedId === faq.id && (
              <Text style={[styles.answer, { color: colors.textSecondary }]}>{faq.answer}</Text>
            )}
          </View>
        ))}
      </ScrollView>
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
  faqCard: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 12 },
  answer: { fontSize: 14, marginTop: 12, lineHeight: 20 },
});