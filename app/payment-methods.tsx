import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from './contexts/ThemeContext';

export default function PaymentMethodsScreen() {
  const { colors } = useTheme();
  
  // Payment Methods available for face-to-face rental
  const [paymentMethods, setPaymentMethods] = useState([
    { 
      id: '1', 
      type: 'Cash', 
      description: 'Pay in cash upon pickup',
      details: 'Bring exact amount when meeting the owner',
      isDefault: true,
      icon: 'cash-outline'
    },
    { 
      id: '2', 
      type: 'GCash', 
      description: 'Pay via GCash to admin',
      details: 'Account: 09123456789 (John Doe)',
      isDefault: false,
      icon: 'phone-portrait-outline'
    },
    { 
      id: '3', 
      type: 'Bank Transfer', 
      description: 'Transfer to school account',
      details: 'BPI: 1234-5678-90 (USTP Rental Services)',
      isDefault: false,
      icon: 'business-outline'
    },
  ]);

  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);

  const setDefaultMethod = (id: string) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
    Alert.alert('Success', 'Default payment method updated');
  };

  const showInstructions = (method: any) => {
    Alert.alert(
      `How to Pay with ${method.type}`,
      `${method.description}\n\n${method.details}\n\nNote: Payment will be verified by the admin before rental confirmation.`,
      [{ text: 'OK', style: 'cancel' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Information Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
          <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Face-to-face payments are verified by the admin. Choose your preferred payment method below.
          </Text>
        </View>

        {paymentMethods.map(method => (
          <View key={method.id} style={[styles.methodCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.methodHeader}>
              <View style={styles.methodInfo}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name={method.icon as any} size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.methodType, { color: colors.text }]}>{method.type}</Text>
                  <Text style={[styles.methodDescription, { color: colors.textSecondary }]}>
                    {method.description}
                  </Text>
                </View>
              </View>
              <View style={styles.methodActions}>
                {method.isDefault && (
                  <View style={[styles.defaultBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Text style={[styles.defaultText, { color: colors.primary }]}>Default</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.methodFooter}>
              <TouchableOpacity 
                style={[styles.instructionButton, { borderColor: colors.border }]}
                onPress={() => showInstructions(method)}
              >
                <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
                <Text style={[styles.instructionText, { color: colors.primary }]}>View Instructions</Text>
              </TouchableOpacity>
              
              {!method.isDefault && (
                <TouchableOpacity 
                  style={[styles.setDefaultButton]}
                  onPress={() => setDefaultMethod(method.id)}
                >
                  <Text style={[styles.setDefaultText, { color: colors.primary }]}>Set as Default</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

        {/* Payment Process Explanation */}
        <View style={[styles.processCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.processTitle, { color: colors.text }]}>How Payment Works</Text>
          <View style={styles.processStep}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              Choose your preferred payment method
            </Text>
          </View>
          <View style={styles.processStep}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              Complete rental request and meet with owner
            </Text>
          </View>
          <View style={styles.processStep}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              Make payment (cash or digital) to owner/admin
            </Text>
          </View>
          <View style={styles.processStep}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              Admin verifies payment and confirms rental
            </Text>
          </View>
        </View>
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 14, lineHeight: 20 },
  methodCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  methodInfo: { flexDirection: 'row', gap: 12, flex: 1 },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodType: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  methodDescription: { fontSize: 12 },
  methodActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  defaultBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  defaultText: { fontSize: 11, fontWeight: '600' },
  methodFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  instructionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  instructionText: { fontSize: 12, fontWeight: '500' },
  setDefaultButton: { paddingVertical: 6 },
  setDefaultText: { fontSize: 12, fontWeight: '500' },
  processCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  processTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  processStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  stepText: { flex: 1, fontSize: 14, lineHeight: 20 },
});