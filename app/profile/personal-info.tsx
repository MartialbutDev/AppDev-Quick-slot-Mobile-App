import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { 
  Alert, 
  Image, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { apiClient } from '../api/client';
import { useTheme } from '../contexts/ThemeContext';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [originalData, setOriginalData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    phone: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { colors } = useTheme();

  // Load current user data
  useEffect(() => {
    loadUserData();
    loadProfileImage();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      if (userData) {
        const user = JSON.parse(userData);
        const userInfo = {
          fullName: user.fullName || '',
          studentId: user.studentId || '',
          email: user.email || '',
          phone: user.phone || '',
        };
        setFormData(userInfo);
        setOriginalData(userInfo);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const loadProfileImage = async () => {
    try {
      const image = await AsyncStorage.getItem('profileImage');
      if (image) {
        setProfileImage(image);
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setProfileImage(imageUri);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('profileImage', imageUri);
      
      Alert.alert('Success', 'Profile picture updated!');
    }
  };

  const hasChanges = () => {
    return (
      formData.fullName !== originalData.fullName ||
      formData.studentId !== originalData.studentId ||
      formData.email !== originalData.email ||
      formData.phone !== originalData.phone
    );
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      Alert.alert('No Changes', 'No changes were made to save.');
      return;
    }

    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare update data (only include changed fields)
      const updateData: any = {};
      if (formData.fullName !== originalData.fullName) updateData.fullName = formData.fullName;
      if (formData.studentId !== originalData.studentId) updateData.studentId = formData.studentId;
      if (formData.email !== originalData.email) updateData.email = formData.email;
      if (formData.phone !== originalData.phone) updateData.phone = formData.phone;

      console.log('Updating profile with:', updateData);

      // ACTUALLY call the backend API
      const response = await apiClient.updateUserProfile(updateData);

      // Update local storage with new data
      const currentUser = await AsyncStorage.getItem('currentUser');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        const updatedUser = { ...user, ...updateData };
        await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }

      // Update original data
      setOriginalData({ ...formData });

      Alert.alert('Success', 'Profile updated successfully!');
      
    } catch (error: any) {
      console.error('Update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = () => {
    router.push('/profile/change-password');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Picture Section - EDITABLE HERE */}
      <View style={[styles.profileImageSection, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.profileInitials, { color: colors.primary }]}>
                {formData.fullName.charAt(0) || 'U'}
              </Text>
            </View>
          )}
          <View style={[styles.editIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={[styles.editPhotoText, { color: colors.primary }]}>Tap to change profile picture</Text>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Personal Information</Text>
      
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={formData.fullName}
            onChangeText={(text) => setFormData({...formData, fullName: text})}
            placeholder="Enter your full name"
            placeholderTextColor={colors.placeholder}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Student ID</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={formData.studentId}
            onChangeText={(text) => setFormData({...formData, studentId: text})}
            placeholder="Enter your student ID"
            placeholderTextColor={colors.placeholder}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            placeholder="Enter your email"
            placeholderTextColor={colors.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text 
            }]}
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            placeholder="Enter your phone number"
            placeholderTextColor={colors.placeholder}
            keyboardType="phone-pad"
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, (!hasChanges() || isLoading) && styles.saveButtonDisabled, { backgroundColor: colors.primary }]} 
          onPress={handleSave}
          disabled={!hasChanges() || isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.changePasswordButton, { borderColor: colors.primary }]}
          onPress={handleChangePassword}
        >
          <Text style={[styles.changePasswordText, { color: colors.primary }]}>Change Password</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileImageSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
    borderRadius: 12,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 8,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editPhotoText: {
    fontSize: 12,
    marginTop: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  changePasswordButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 10,
  },
  changePasswordText: {
    fontSize: 16,
    fontWeight: '600',
  },
});