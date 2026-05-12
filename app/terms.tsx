import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from './contexts/ThemeContext';

export default function TermsScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms & Conditions</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Rental Agreement</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            By renting any gadget through QuickSlot, you agree to return the item in the same condition as received. 
            You are responsible for any damage or loss during the rental period.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Rental Period</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            The rental period begins on the agreed pickup date and ends on the specified return date. 
            Late returns will incur a fee of ₱50 per day.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Payment Terms</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            Payment must be completed before or at the time of pickup. 
            Accepted payment methods include GCash, Cash on Meetup, and Delivery.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Cancellation Policy</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            Cancellations made within 24 hours of the rental start time may incur a fee. 
            Please notify the owner immediately if you need to cancel.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>5. User Conduct</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            Users must use rented gadgets responsibly and for their intended purpose. 
            Any misuse or illegal activity will result in immediate account suspension.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Privacy Policy</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            We collect and use your personal information only for rental purposes. 
            Your data is protected and will not be shared with third parties without consent.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Limitation of Liability</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            QuickSlot is not responsible for any indirect damages arising from the use of rented gadgets. 
            Users assume full responsibility during the rental period.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Account Termination</Text>
          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
            QuickSlot reserves the right to suspend or terminate accounts that violate these terms or 
            engage in fraudulent activities.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Last updated: May 10, 2026
          </Text>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
    marginBottom: 30,
  },
  footerText: {
    fontSize: 12,
  },
});