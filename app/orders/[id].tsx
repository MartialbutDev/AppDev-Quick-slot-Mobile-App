import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';

interface OrderItem {
  id: string;
  name: string;
  price: string;
  image: any;
  owner: string;
  rentalDuration: string;
  quantity: number;
  totalPrice: number;
}

interface Order {
  id: number;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  status: string;
  contactInfo: {
    fullName: string;
    phoneNumber: string;
    email: string;
    meetupLocation?: string;
    deliveryAddress?: string;
  };
  specialInstructions: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailScreen() {
  const params = useLocalSearchParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  const loadOrderDetails = async () => {
    try {
      const response = await apiClient.getOrderById(parseInt(orderId));
      setOrder(response.order);
    } catch (error: any) {
      console.error('Error loading order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const handleBack = () => {
    router.back();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'confirmed': return colors.primary;
      case 'in_progress': return '#5856D6';
      case 'completed': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'confirmed': return 'checkmark-circle-outline';
      case 'in_progress': return 'sync-outline';
      case 'completed': return 'checkmark-done-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleContactOwner = () => {
    Alert.alert('Contact Owner', 'This will open your messaging app.');
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await apiClient.updateOrderStatus(parseInt(orderId), newStatus);
      Alert.alert('Success', `Order status updated to ${newStatus}`);
      loadOrderDetails(); // Reload order details
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { 
          backgroundColor: colors.surface,
          borderBottomColor: colors.border 
        }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Order Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { 
          backgroundColor: colors.surface,
          borderBottomColor: colors.border 
        }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Order Details</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Order Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Ionicons name={getStatusIcon(order.status) as any} size={20} color="#fff" />
              <Text style={styles.statusText}>{order.status.replace('_', ' ')}</Text>
            </View>
            <Text style={[styles.orderNumber, { color: colors.text }]}>Order #{order.orderNumber}</Text>
          </View>
          <Text style={[styles.orderDate, { color: colors.textSecondary }]}>Placed on {formatDate(order.createdAt)}</Text>
        </View>

        {/* Contact Information */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Full Name</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{order.contactInfo.fullName}</Text>
            
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone Number</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{order.contactInfo.phoneNumber}</Text>
            
            {order.contactInfo.email && (
              <>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{order.contactInfo.email}</Text>
              </>
            )}
            
            {order.contactInfo.meetupLocation && (
              <>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Meetup Location</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{order.contactInfo.meetupLocation}</Text>
              </>
            )}
            
            {order.contactInfo.deliveryAddress && (
              <>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Delivery Address</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{order.contactInfo.deliveryAddress}</Text>
              </>
            )}
          </View>
        </View>

        {/* Order Items */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Items</Text>
          <View style={styles.itemsContainer}>
            {order.items.map((item, index) => (
              <View key={index} style={[styles.orderItem, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                <Image source={item.image} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.itemOwner, { color: colors.textSecondary }]}>Owner: {item.owner}</Text>
                  <Text style={[styles.itemInfo, { color: colors.textSecondary }]}>
                    {item.quantity}x • {item.rentalDuration}
                  </Text>
                </View>
                <Text style={[styles.itemPrice, { color: colors.primary }]}>₱{item.totalPrice.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <View style={[styles.section, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Special Instructions</Text>
            <View style={[styles.infoCard, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <Text style={[styles.instructionsText, { color: colors.text }]}>{order.specialInstructions}</Text>
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
          <View style={[styles.summaryCard, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Payment Method</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{order.paymentMethod}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Amount</Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>₱{order.totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons (for testing) */}
        {__DEV__ && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Development Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => handleUpdateStatus('confirmed')}
              >
                <Text style={styles.actionButtonText}>Mark as Confirmed</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.success }]}
                onPress={() => handleUpdateStatus('completed')}
              >
                <Text style={styles.actionButtonText}>Mark as Completed</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                onPress={() => handleUpdateStatus('cancelled')}
              >
                <Text style={styles.actionButtonText}>Cancel Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { 
        backgroundColor: colors.surface,
        borderTopColor: colors.border 
      }]}>
        <TouchableOpacity 
          style={[styles.contactButton, { borderColor: colors.primary }]}
          onPress={handleContactOwner}
        >
          <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
          <Text style={[styles.contactButtonText, { color: colors.primary }]}>Contact Owner</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  itemsContainer: {
    gap: 12,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
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
  itemOwner: {
    fontSize: 14,
    marginBottom: 2,
  },
  itemInfo: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
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
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButtons: {
    gap: 8,
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});