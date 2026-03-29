import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function SuccessScreen() {
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  
  const orderDetails = {
    orderId: params.orderId as string,
    totalAmount: parseFloat(params.totalAmount as string),
    paymentMethod: params.paymentMethod as string,
    contactInfo: {
      fullName: params.fullName as string,
      phoneNumber: params.phoneNumber as string,
      meetupLocation: params.meetupLocation as string,
      deliveryAddress: params.deliveryAddress as string,
    },
  };

  const handleBrowseMore = () => {
    router.push('/(tabs)/explore');
  };

  const handleViewOrders = () => {
    Alert.alert('Coming Soon', 'Order history feature will be available soon!');
  };

  const handleContactOwner = () => {
    Alert.alert('Contact Owner', 'This will open your messaging app to contact the owner.');
  };

  const getPaymentInstructions = () => {
    switch (orderDetails.paymentMethod.toLowerCase()) {
      case 'gcash':
        return {
          icon: 'phone-portrait',
          color: colors.primary,
          instructions: [
            'Open your GCash app',
            'Send payment to: 0917 123 4567',
            `Use Order ID: ${orderDetails.orderId} as reference`,
            'Keep the transaction receipt',
          ],
          nextStep: 'You will receive a confirmation message once payment is verified.',
        };
      case 'cash':
        return {
          icon: 'cash',
          color: colors.success,
          instructions: [
            'Prepare exact amount in cash',
            'Meet at the specified location',
            'Verify item condition before payment',
            'Get receipt from the owner',
          ],
          nextStep: `Meetup Location: ${orderDetails.contactInfo.meetupLocation}`,
        };
      case 'delivery':
        return {
          icon: 'car',
          color: colors.warning,
          instructions: [
            'Payment upon delivery',
            'Verify item condition before paying',
            'Pay the delivery rider',
            'Keep the receipt for reference',
          ],
          nextStep: `Delivery to: ${orderDetails.contactInfo.deliveryAddress}`,
        };
      default:
        return {
          icon: 'card',
          color: colors.primary,
          instructions: ['Please follow payment instructions provided by the owner.'],
          nextStep: 'The owner will contact you shortly.',
        };
    }
  };

  const paymentInfo = getPaymentInstructions();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={[styles.successHeader, { backgroundColor: colors.inputBackground }]}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Rental Confirmed!</Text>
          <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
            Your order has been successfully placed
          </Text>
          <View style={[styles.orderIdContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.orderIdLabel, { color: colors.textSecondary }]}>Order ID:</Text>
            <Text style={[styles.orderId, { color: colors.primary }]}>{orderDetails.orderId}</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
          <View style={[styles.summaryCard, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Amount:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>₱{orderDetails.totalAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Payment Method:</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{orderDetails.paymentMethod}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Status:</Text>
              <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
                <Text style={styles.statusText}>Confirmed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Next Steps */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>What Happens Next</Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: paymentInfo.color }]}>
                <Ionicons name={paymentInfo.icon as any} size={20} color="#fff" />
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Complete Payment</Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  {orderDetails.paymentMethod === 'gcash' 
                    ? 'Please complete your GCash payment within 1 hour'
                    : 'Be ready with your payment method'}
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: colors.warning }]}>
                <Ionicons name="time" size={20} color="#fff" />
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Schedule Pickup/Delivery</Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  {paymentInfo.nextStep}
                </Text>
                <Text style={[styles.timeEstimate, { color: colors.primary }]}>
                  The owner will contact you within 30 minutes to confirm timing
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={[styles.stepIcon, { backgroundColor: '#5856D6' }]}>
                <Ionicons name="chatbubble" size={20} color="#fff" />
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>Stay in Touch</Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
                  Contact the owner for any questions or changes to your order
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Instructions */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Instructions</Text>
          <View style={styles.instructionsContainer}>
            {paymentInfo.instructions.map((instruction, index) => (
              <View key={index} style={styles.instructionStep}>
                <View style={[styles.instructionNumber, { backgroundColor: paymentInfo.color }]}>
                  <Text style={styles.instructionNumberText}>{index + 1}</Text>
                </View>
                <Text style={[styles.instructionText, { color: colors.text }]}>{instruction}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Need Help?</Text>
          <View style={styles.helpContainer}>
            <TouchableOpacity style={[styles.helpButton, { backgroundColor: colors.inputBackground, borderColor: colors.border }]} onPress={handleContactOwner}>
              <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
              <Text style={[styles.helpButtonText, { color: colors.primary }]}>Contact Owner</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.helpButton, { backgroundColor: colors.inputBackground, borderColor: colors.border }]} onPress={handleViewOrders}>
              <Ionicons name="list" size={20} color={colors.primary} />
              <Text style={[styles.helpButtonText, { color: colors.primary }]}>View My Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.helpButton, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <Ionicons name="help-circle" size={20} color={colors.primary} />
              <Text style={[styles.helpButtonText, { color: colors.primary }]}>Support Center</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { 
        backgroundColor: colors.surface,
        borderTopColor: colors.border 
      }]}>
        <TouchableOpacity 
          style={[styles.secondaryButton, { borderColor: colors.primary }]}
          onPress={handleBrowseMore}
        >
          <Ionicons name="search" size={20} color={colors.primary} />
          <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Browse More Items</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={handleViewOrders}
        >
          <Ionicons name="receipt" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>View My Orders</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  successHeader: {
    alignItems: 'center',
    padding: 30,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  orderIdLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepsContainer: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  timeEstimate: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  instructionsContainer: {
    gap: 12,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  helpContainer: {
    gap: 12,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
