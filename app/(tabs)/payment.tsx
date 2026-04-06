import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function PaymentScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState("gcash");
  const [showReceipt, setShowReceipt] = useState(false); // <-- State to control modal

  const paymentMethods = [
    {
      id: "gcash",
      title: "GCash",
      subtitle: "Pay easily using your GCash wallet",
      iconType: "custom_g",
    },
    {
      id: "maya",
      title: "Maya",
      subtitle: "Pay with your Maya account",
      iconType: "custom_maya",
    },
    {
      id: "card",
      title: "Credit / Debit Card",
      subtitle: "Visa, Mastercard, and more",
      iconType: "card-outline",
    },
    {
      id: "cash",
      title: "Cash on Pickup",
      subtitle: "Pay in cash when you receive the item",
      iconType: "wallet-outline",
    },
  ];

  const renderIcon = (type: string) => {
    if (type === "custom_g") {
      return (
        <View style={[styles.iconBox, { backgroundColor: "#2563eb" }]}>
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
            G
          </Text>
        </View>
      );
    }
    if (type === "custom_maya") {
      return (
        <View style={[styles.iconBox, { backgroundColor: "#064e3b" }]}>
          <Text style={{ color: "#4ade80", fontWeight: "bold", fontSize: 12 }}>
            maya
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.iconBoxDark}>
        <Ionicons name={type as any} size={24} color="#3b82f6" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIcon}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.secureNotice}>
          <Ionicons name="shield-checkmark" size={16} color="#3b82f6" />
          <Text style={styles.secureText}>
            Your payment is secure and encrypted
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Select a Payment Method</Text>

        <View style={styles.methodsContainer}>
          {paymentMethods.map((method) => {
            const isSelected = selectedMethod === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                activeOpacity={0.7}
                onPress={() => setSelectedMethod(method.id)}
                style={[
                  styles.methodCard,
                  isSelected && styles.methodCardSelected,
                ]}
              >
                <View style={styles.methodInfo}>
                  {renderIcon(method.iconType)}
                  <View style={styles.methodTextContainer}>
                    <Text style={styles.methodTitle}>{method.title}</Text>
                    <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.itemRow}>
            <View style={styles.itemImagePlaceholder}></View>
            <View style={styles.itemDetails}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>MacBook Air M2</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Laptop</Text>
                </View>
              </View>
              <Text style={styles.itemSpecs}>
                13-inch • 8GB RAM • 256GB SSD
              </Text>
            </View>
          </View>
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Ionicons name="calendar-outline" size={16} color="#3b82f6" />
              <Text style={styles.dateLabel}>Rental Duration</Text>
            </View>
            <Text style={styles.dateValue}>3 Days</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₱3,750.00</Text>
          </View>
        </View>
      </ScrollView>

      {/* FIXED BOTTOM BUTTON */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.confirmButton}
          onPress={() => setShowReceipt(true)} // <-- Now opens the built-in modal
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.confirmButtonText}>Confirm Payment</Text>
        </TouchableOpacity>
      </View>

      {/* NATIVE RECEIPT MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showReceipt}
        onRequestClose={() => setShowReceipt(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.receiptContainer}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#10b981" />
            </View>

            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSubtitle}>
              Your gadget is secured and ready.
            </Text>

            <View style={styles.receiptCardModal}>
              <View style={styles.receiptRowModal}>
                <Text style={styles.receiptLabelModal}>Transaction ID</Text>
                <Text style={styles.receiptValueModal}>#QS-0982736</Text>
              </View>
              <View style={styles.receiptRowModal}>
                <Text style={styles.receiptLabelModal}>Method</Text>
                <Text style={styles.receiptValueModal}>
                  {paymentMethods.find((m) => m.id === selectedMethod)?.title}
                </Text>
              </View>
              <View style={styles.receiptDividerModal} />
              <View style={styles.receiptTotalRowModal}>
                <Text style={styles.receiptTotalLabelModal}>Amount Paid</Text>
                <Text style={styles.receiptTotalValueModal}>₱3,750.00</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.homeButtonModal}
                onPress={() => {
                  setShowReceipt(false);
                  router.push("/(tabs)/explore");
                }}
              >
                <Text style={styles.homeButtonTextModal}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Original Payment Styles
  safeArea: { flex: 1, backgroundColor: "#0f0f11" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "android" ? 20 : 10,
  },
  headerIcon: { padding: 8 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "600" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 100 },
  secureNotice: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
  },
  secureText: { color: "#9ca3af", fontSize: 13 },
  sectionTitle: {
    color: "#e5e7eb",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  methodsContainer: { gap: 12, marginBottom: 24 },
  methodCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1b1e",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  methodCardSelected: { borderColor: "#3b82f6" },
  methodInfo: { flexDirection: "row", alignItems: "center", gap: 16 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBoxDark: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#25262b",
    justifyContent: "center",
    alignItems: "center",
  },
  methodTextContainer: { gap: 4 },
  methodTitle: { color: "#e5e7eb", fontSize: 15, fontWeight: "500" },
  methodSubtitle: { color: "#6b7280", fontSize: 12 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#4b5563",
    justifyContent: "center",
    alignItems: "center",
  },
  radioOuterSelected: { borderColor: "#3b82f6" },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3b82f6",
  },
  summaryCard: {
    backgroundColor: "#1a1b1e",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  itemRow: { flexDirection: "row", gap: 16, marginBottom: 20 },
  itemImagePlaceholder: {
    width: 60,
    height: 45,
    backgroundColor: "#2d2d2d",
    borderRadius: 8,
  },
  itemDetails: { flex: 1, justifyContent: "center" },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  itemTitle: { color: "#e5e7eb", fontSize: 15, fontWeight: "500" },
  badge: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: { color: "#60a5fa", fontSize: 10, fontWeight: "600" },
  itemSpecs: { color: "#9ca3af", fontSize: 12 },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  dateLabel: { color: "#9ca3af", fontSize: 13 },
  dateValue: { color: "#e5e7eb", fontSize: 13 },
  divider: {
    height: 1,
    borderWidth: 1,
    borderColor: "#374151",
    borderStyle: "dashed",
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
  },
  totalLabel: { color: "#e5e7eb", fontSize: 16, fontWeight: "600" },
  totalValue: { color: "#3b82f6", fontSize: 20, fontWeight: "bold" },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15, 15, 17, 0.95)",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 32 : 20,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
  },
  confirmButton: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: { color: "white", fontSize: 16, fontWeight: "600" },

  // New Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  receiptContainer: {
    backgroundColor: "#0f0f11",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: "#27272a",
  },
  successIconContainer: { alignItems: "center", marginBottom: 16 },
  successTitle: {
    color: "#e5e7eb",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  successSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  receiptCardModal: {
    backgroundColor: "#1a1b1e",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  receiptRowModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  receiptLabelModal: { color: "#9ca3af", fontSize: 13 },
  receiptValueModal: { color: "#e5e7eb", fontSize: 13, fontWeight: "500" },
  receiptDividerModal: {
    height: 1,
    borderWidth: 1,
    borderColor: "#374151",
    borderStyle: "dashed",
    marginVertical: 16,
  },
  receiptTotalRowModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receiptTotalLabelModal: { color: "#e5e7eb", fontSize: 16, fontWeight: "600" },
  receiptTotalValueModal: {
    color: "#10b981",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalActions: { gap: 12, paddingBottom: Platform.OS === "ios" ? 20 : 0 },
  homeButtonModal: {
    height: 54,
    borderRadius: 27,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  homeButtonTextModal: { color: "white", fontSize: 16, fontWeight: "600" },
});
