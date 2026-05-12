import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export default function FAQsScreen() {
  const { colors } = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I rent a gadget?',
      answer: 'Browse gadgets on the Home page, select an item, choose your rental duration (hourly/daily/weekly), and click "Rent Now". Follow the checkout process to complete your rental.',
    },
    {
      id: '2',
      question: 'What payment methods are accepted?',
      answer: 'We accept Cash on Meetup, GCash, Bank Transfer, and PayMaya. You can set your default payment method in the Payment Methods page.',
    },
    {
      id: '3',
      question: 'How do I track my rentals?',
      answer: 'Go to the History tab to see all your active and past rentals. You can also view order details by tapping on any rental item.',
    },
    {
      id: '4',
      question: 'What happens if I return a gadget late?',
      answer: 'Late returns will incur a late fee of ₱50 per day. The fee will be added to your total rental cost when you return the item.',
    },
    {
      id: '5',
      question: 'How do I contact the gadget owner?',
      answer: 'You can message gadget owners directly through the Messages page. Start a conversation from the product detail page or your order history.',
    },
    {
      id: '6',
      question: 'Can I cancel my rental?',
      answer: 'Yes, you can cancel pending rentals. Go to your Orders page and select "Cancel Order". Already confirmed rentals may have cancellation fees.',
    },
    {
      id: '7',
      question: 'How do I become a gadget owner?',
      answer: 'Tap the "+" button in the bottom navigation to list your items for rent. Fill in the gadget details and set your rental price.',
    },
    {
      id: '8',
      question: 'Is my personal information secure?',
      answer: 'Yes, we take security seriously. Your data is encrypted and we follow strict privacy policies to protect your information.',
    },
    {
      id: '9',
      question: 'What if the gadget is damaged?',
      answer: 'Inspect the gadget upon pickup. Report any damages immediately to the owner. You may be liable for damages caused during your rental period.',
    },
    {
      id: '10',
      question: 'How do I leave a review?',
      answer: 'After completing a rental, you can rate and review the gadget and owner on the Reviews page or directly from your order history.',
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {faqs.map((faq) => (
          <View key={faq.id} style={[styles.faqCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.questionContainer}
              onPress={() => toggleExpand(faq.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.question, { color: colors.text }]}>{faq.question}</Text>
              <Ionicons
                name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            {expandedId === faq.id && (
              <View style={styles.answerContainer}>
                <View style={[styles.answerDivider, { backgroundColor: colors.border }]} />
                <Text style={[styles.answer, { color: colors.textSecondary }]}>
                  {faq.answer}
                </Text>
              </View>
            )}
          </View>
        ))}
        
        {/* Contact Support Section */}
        <View style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.contactTitle, { color: colors.text }]}>Still have questions?</Text>
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            Can't find the answer you're looking for? Please contact our support team.
          </Text>
          <TouchableOpacity style={[styles.contactButton, { backgroundColor: colors.primary }]}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
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
  faqCard: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  question: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 12, lineHeight: 22 },
  answerContainer: { paddingBottom: 16 },
  answerDivider: { height: 1, marginHorizontal: 16, marginBottom: 12 },
  answer: { fontSize: 14, lineHeight: 20, marginHorizontal: 16 },
  contactCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  contactTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  contactText: { fontSize: 14, textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  contactButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});