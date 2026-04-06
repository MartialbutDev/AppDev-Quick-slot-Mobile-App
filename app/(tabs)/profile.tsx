import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export default function ProfileScreen() {
  const { colors } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
    loadProfileImage();

    // Refresh profile image when updated from personal info
    const interval = setInterval(() => {
      loadProfileImage();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const loadUserProfile = async () => {
    try {
      const currentUser = await AsyncStorage.getItem("currentUser");
      if (currentUser) setUser(JSON.parse(currentUser));
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfileImage = async () => {
    try {
      const image = await AsyncStorage.getItem("profileImage");
      if (image) setProfileImage(image);
    } catch (error) {
      console.error("Error loading profile image:", error);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header - PURELY VIEW ONLY - NO CAMERA ICON */}
        <View
          style={[styles.profileHeader, { backgroundColor: colors.surface }]}
        >
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View
                style={[
                  styles.profileImagePlaceholder,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Text
                  style={[styles.profileInitials, { color: colors.primary }]}
                >
                  {user?.fullName?.charAt(0) || "U"}
                </Text>
              </View>
            )}
            {/* NO CAMERA ICON HERE - View only */}
          </View>

          <Text style={[styles.userName, { color: colors.text }]}>
            {user?.fullName || "User"}
          </Text>
          <Text style={[styles.userId, { color: colors.textSecondary }]}>
            {user?.studentId || "Student ID"}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user?.email || "Email"}
          </Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/profile/personal-info")}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name="person-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.menuLabel, { color: colors.text }]}>
                Personal Information
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/payment-methods")}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="card-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>
                Payment Methods
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/messages")}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name="chatbubble-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.menuLabel, { color: colors.text }]}>
                Messages
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/reviews")}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="star-outline" size={24} color={colors.primary} />
              <Text style={[styles.menuLabel, { color: colors.text }]}>
                Reviews
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/faqs")}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.menuLabel, { color: colors.text }]}>
                FAQs
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/settings")}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name="settings-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.menuLabel, { color: colors.text }]}>
                Settings
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/profile/address")}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name="location-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.menuLabel, { color: colors.text }]}>
                Address
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push("/profile/change-password")}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={colors.primary}
              />
              <Text style={[styles.menuLabel, { color: colors.text }]}>
                Change Password
              </Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  userName: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  userId: { fontSize: 14 },
  menuContainer: { paddingHorizontal: 16, paddingTop: 24 },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuLabel: { fontSize: 16 },
});
