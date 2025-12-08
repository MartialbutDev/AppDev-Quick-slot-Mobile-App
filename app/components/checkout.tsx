import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from './cart';

type PaymentMethod = 'gcash' | 'cash' | 'delivery';

export default function CheckoutScreen() {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { colors } = useTheme();
  
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('gcash');
  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    meetupLocation: '',
    deliveryAddress: '',
    specialInstructions: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case 'hours': return 'Hourly';
      case 'days': return 'Daily';
      case 'weeks': return 'Weekly';
      default: return duration;
    }
  };

  const handlePlaceOrder = async () => {
    if (!contactInfo.fullName || !contactInfo.phoneNumber) {
      Alert.alert('Missing Information', 'Please fill in your full name and phone number.');
      return;
    }

    if (selectedPayment === 'cash' && !contactInfo.meetupLocation) {
      Alert.alert('Missing Information', 'Please specify a meetup location for cash payment.');
      return;
    }

    if (selectedPayment === 'delivery' && !contactInfo.deliveryAddress) {
      Alert.alert('Missing Information', 'Please provide a delivery address.');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('📦 Creating order in backend...');
      
      // Create order data for backend
      const orderData = {
        items: cartItems,
        totalAmount: getTotalPrice(),
        paymentMethod: selectedPayment,
        contactInfo: contactInfo,
        specialInstructions: contactInfo.specialInstructions,
      };

      console.log('🛒 Order data:', orderData);

      // ✅ UPDATED: Use the dedicated createOrder method instead of generic request
      const response = await apiClient.createOrder(orderData);

      console.log('✅ Order created:', response.order.orderNumber);

      // Navigate to success page with order details
      router.push({
        pathname: '../components/success',
        params: {
          orderId: response.order.orderNumber,
          totalAmount: getTotalPrice().toFixed(2),
          paymentMethod: selectedPayment,
          fullName: contactInfo.fullName,
          phoneNumber: contactInfo.phoneNumber,
          meetupLocation: contactInfo.meetupLocation,
          deliveryAddress: contactInfo.deliveryAddress,
        }
      });
      
      // Clear cart after successful order
      clearCart();
      
    } catch (error: any) {
      console.error('❌ Order creation failed:', error);
      Alert.alert('Order Failed', error.message || 'Failed to create order. Please try again.');
      setIsProcessing(false);
    }
  };

  const renderOrderSummary = () => (
    <View style={[styles.section, { borderBottomColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
      {cartItems.map((item) => (
        <View key={`${item.id}-${item.rentalDuration}`} style={styles.orderItem}>
          <Image source={item.image} style={styles.itemImage} />
          <View style={styles.itemDetails}>
            <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.itemInfo, { color: colors.textSecondary }]}>Owner: {item.owner}</Text>
            <Text style={[styles.itemInfo, { color: colors.textSecondary }]}>
              {getDurationLabel(item.rentalDuration)} • Qty: {item.quantity}
            </Text>
          </View>
          <Text style={[styles.itemPrice, { color: colors.primary }]}>₱{item.totalPrice.toFixed(2)}</Text>
        </View>
      ))}
      
      <View style={styles.totalContainer}>
        <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount:</Text>
        <Text style={[styles.totalPrice, { color: colors.primary }]}>₱{getTotalPrice().toFixed(2)}</Text>
      </View>
    </View>
  );

  const renderContactInfo = () => (
    <View style={[styles.section, { borderBottomColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
      
      {/* Full Name */}
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            color: colors.text 
          }]}
          placeholder="Enter your full name"
          placeholderTextColor={colors.placeholder}
          value={contactInfo.fullName}
          onChangeText={(text) => setContactInfo({...contactInfo, fullName: text})}
        />
      </View>

      {/* Phone Number */}
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            color: colors.text 
          }]}
          placeholder="Enter your phone number"
          placeholderTextColor={colors.placeholder}
          value={contactInfo.phoneNumber}
          onChangeText={(text) => setContactInfo({...contactInfo, phoneNumber: text})}
          keyboardType="phone-pad"
        />
      </View>

      {/* Email Address */}
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            color: colors.text 
          }]}
          placeholder="Enter your email address"
          placeholderTextColor={colors.placeholder}
          value={contactInfo.email}
          onChangeText={(text) => setContactInfo({...contactInfo, email: text})}
          keyboardType="email-address"
        />
      </View>

      {/* Meetup Location (shown for cash payment) */}
      {selectedPayment === 'cash' && (
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Meetup Location *</Text>
          <TextInput
            style={[styles.input, styles.textArea, { 
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text 
            }]}
            placeholder="Where would you like to meet the owner? (e.g., University Library, Coffee Shop near campus)"
            placeholderTextColor={colors.placeholder}
            value={contactInfo.meetupLocation}
            onChangeText={(text) => setContactInfo({...contactInfo, meetupLocation: text})}
            multiline
            numberOfLines={3}
          />
        </View>
      )}

      {/* Delivery Address (shown for delivery payment) */}
      {selectedPayment === 'delivery' && (
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Delivery Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea, { 
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text 
            }]}
            placeholder="Enter your complete delivery address"
            placeholderTextColor={colors.placeholder}
            value={contactInfo.deliveryAddress}
            onChangeText={(text) => setContactInfo({...contactInfo, deliveryAddress: text})}
            multiline
            numberOfLines={3}
          />
        </View>
      )}

      {/* Special Instructions */}
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Special Instructions</Text>
        <TextInput
          style={[styles.input, styles.textArea, { 
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            color: colors.text 
          }]}
          placeholder="Any special requests or instructions for the owner..."
          placeholderTextColor={colors.placeholder}
          value={contactInfo.specialInstructions}
          onChangeText={(text) => setContactInfo({...contactInfo, specialInstructions: text})}
          multiline
          numberOfLines={2}
        />
      </View>
    </View>
  );

  const renderPaymentMethods = () => (
    <View style={[styles.section, { borderBottomColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
      
      <TouchableOpacity
        style={[
          styles.paymentOption,
          { backgroundColor: colors.inputBackground, borderColor: colors.border },
          selectedPayment === 'gcash' && [styles.selectedPaymentOption, { borderColor: colors.primary, backgroundColor: colors.categoryIcon }]
        ]}
        onPress={() => setSelectedPayment('gcash')}
      >
        <View style={styles.paymentHeader}>
          <Ionicons name="phone-portrait" size={24} color={colors.primary} />
          <Text style={[styles.paymentTitle, { color: colors.text }]}>GCash</Text>
        </View>
        <Text style={[styles.paymentDescription, { color: colors.textSecondary }]}>
          Pay securely via GCash. You'll receive payment instructions after order confirmation.
        </Text>
        {selectedPayment === 'gcash' && (
          <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={styles.selectedIcon} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paymentOption,
          { backgroundColor: colors.inputBackground, borderColor: colors.border },
          selectedPayment === 'cash' && [styles.selectedPaymentOption, { borderColor: colors.success, backgroundColor: colors.categoryIcon }]
        ]}
        onPress={() => setSelectedPayment('cash')}
      >
        <View style={styles.paymentHeader}>
          <Ionicons name="cash" size={24} color={colors.success} />
          <Text style={[styles.paymentTitle, { color: colors.text }]}>Cash on Meetup</Text>
        </View>
        <Text style={[styles.paymentDescription, { color: colors.textSecondary }]}>
          Pay with cash when you meet the owner to pick up the items.
        </Text>
        {selectedPayment === 'cash' && (
          <Ionicons name="checkmark-circle" size={20} color={colors.success} style={styles.selectedIcon} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paymentOption,
          { backgroundColor: colors.inputBackground, borderColor: colors.border },
          selectedPayment === 'delivery' && [styles.selectedPaymentOption, { borderColor: colors.warning, backgroundColor: colors.categoryIcon }]
        ]}
        onPress={() => setSelectedPayment('delivery')}
      >
        <View style={styles.paymentHeader}>
          <Ionicons name="car" size={24} color={colors.warning} />
          <Text style={[styles.paymentTitle, { color: colors.text }]}>Delivery</Text>
        </View>
        <Text style={[styles.paymentDescription, { color: colors.textSecondary }]}>
          Get items delivered to your location. Additional delivery fees may apply.
        </Text>
        {selectedPayment === 'delivery' && (
          <Ionicons name="checkmark-circle" size={20} color={colors.warning} style={styles.selectedIcon} />
        )}
      </TouchableOpacity>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderOrderSummary()}
        {renderContactInfo()}
        {renderPaymentMethods()}
        
        {/* Terms and Conditions */}
        <View style={styles.termsSection}>
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            By placing this order, you agree to our rental terms and conditions. 
            Cancellations may be subject to fees based on our cancellation policy.
          </Text>
        </View>
      </ScrollView>

      {/* Checkout Footer */}
      <View style={[styles.footer, { 
        backgroundColor: colors.surface,
        borderTopColor: colors.border 
      }]}>
        <View style={styles.footerTotal}>
          <Text style={[styles.footerTotalLabel, { color: colors.text }]}>Total:</Text>
          <Text style={[styles.footerTotalPrice, { color: colors.primary }]}>₱{getTotalPrice().toFixed(2)}</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.placeOrderButton, isProcessing && styles.placeOrderButtonDisabled, { backgroundColor: colors.primary }]}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Text style={styles.placeOrderText}>Processing...</Text>
          ) : (
            <>
              <Ionicons name="lock-closed" size={20} color="#fff" />
              <Text style={styles.placeOrderText}>Place Order</Text>
            </>
          )}
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
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
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
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemInfo: {
    fontSize: 14,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  selectedPaymentOption: {
    borderWidth: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  paymentDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  selectedIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  termsSection: {
    padding: 20,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  footerTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerTotalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});