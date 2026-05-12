import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiClient } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';

// Backend API base URL for images
const API_BASE_URL = 'http://192.168.1.63:8000';

const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

interface OrderItem {
  id: string;
  name: string;
  price: string;
  image: any;
  owner: string;
  rentalDuration: string;
  quantity: number;
  totalPrice: number;
  image_url?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  status: 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export default function HistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getOrderHistory();
      // Ensure orders have proper structure with fallbacks
      const formattedOrders = (response.orders || []).map((order: any) => ({
        ...order,
        totalAmount: parseFloat(order.totalAmount) || 0,
        items: (order.items || []).map((item: any) => ({
          ...item,
          totalPrice: parseFloat(item.totalPrice) || 0,
          quantity: item.quantity || 1,
          rentalDuration: item.rentalDuration || 'days',
          owner: item.owner || 'QuickSlot Partner',
          image: item.image_url ? { uri: getImageUrl(item.image_url) } : require('../../assets/images/Quickslot.png'),
        })),
      }));
      setOrders(formattedOrders);
    } catch (error: any) {
      console.error('Error loading order history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-done-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={[styles.orderCard, { 
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: colors.shadow,
      }]}
      onPress={() => router.push({
        pathname: '/orders/[id]',
        params: { id: item.id.toString() }
      })}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={[styles.orderNumber, { color: colors.text }]}>Order #{item.orderNumber}</Text>
          <Text style={[styles.orderDate, { color: colors.textSecondary }]}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status) as any} size={14} color="#fff" />
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.itemsContainer}>
        {item.items.slice(0, 2).map((orderItem, index) => (
          <View key={index} style={styles.itemRow}>
            <Image source={orderItem.image} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={[styles.itemName, { color: colors.text }]}>{orderItem.name}</Text>
              <Text style={[styles.itemInfo, { color: colors.textSecondary }]}>
                {orderItem.quantity}x • {orderItem.rentalDuration}
              </Text>
            </View>
            <Text style={[styles.itemPrice, { color: colors.primary }]}>
              ₱{orderItem.totalPrice.toFixed(2)}
            </Text>
          </View>
        ))}
        {item.items.length > 2 && (
          <Text style={[styles.moreItems, { color: colors.primary }]}>+{item.items.length - 2} more items</Text>
        )}
      </View>

      <View style={[styles.orderFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.paymentMethod, { color: colors.textSecondary }]}>{item.paymentMethod || 'Cash'}</Text>
        <Text style={[styles.totalAmount, { color: colors.primary }]}>₱{item.totalAmount.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { 
          backgroundColor: colors.surface,
          borderBottomColor: colors.border 
        }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Order History</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading order history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { 
        backgroundColor: colors.surface,
        borderBottomColor: colors.border 
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Order History</Text>
        <TouchableOpacity onPress={loadOrders} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="archive-outline" size={80} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No order history</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Your completed and cancelled orders will appear here
          </Text>
          <TouchableOpacity 
            style={[styles.browseButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <Text style={styles.browseButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  refreshButton: {
    padding: 4,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  browseButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemInfo: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  moreItems: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  paymentMethod: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});