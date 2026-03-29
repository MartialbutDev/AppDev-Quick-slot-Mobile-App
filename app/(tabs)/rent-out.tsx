import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
  View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ProductForm {
  name: string;
  description: string;
  category: string;
  price: string;
  rentalDuration: 'hours' | 'days' | 'weeks';
  condition: 'excellent' | 'good' | 'fair';
  images: string[];
  specs: string[];
}

export default function RentOutScreen() {
  const [form, setForm] = useState<ProductForm>({
    name: '',
    description: '',
    category: '',
    price: '',
    rentalDuration: 'hours',
    condition: 'good',
    images: [],
    specs: [],
  });
  
  const [currentSpec, setCurrentSpec] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colors } = useTheme();

  const categories = [
    'Laptops',
    'Gaming PCs', 
    'Tablets',
    'Cameras',
    'Phones',
    'Accessories'
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload images.');
      return;
    }
    

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setForm(prev => ({
        ...prev,
        images: [...prev.images, result.assets[0].uri]
      }));
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setForm(prev => ({
        ...prev,
        images: [...prev.images, result.assets[0].uri]
      }));
    }
  };

  const addSpec = () => {
    if (currentSpec.trim() && !form.specs.includes(currentSpec.trim())) {
      setForm(prev => ({
        ...prev,
        specs: [...prev.specs, currentSpec.trim()]
      }));
      setCurrentSpec('');
    }
  };

  const removeSpec = (index: number) => {
    setForm(prev => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index)
    }));
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.category || !form.price || form.images.length === 0) {
      Alert.alert('Missing Information', 'Please fill in all required fields and add at least one image.');
      return;
    }

    if (parseFloat(form.price) <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price greater than 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically send the data to your backend
      console.log('Submitting product:', form);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success!', 
        'Your item has been listed for rent successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and navigate back
              setForm({
                name: '',
                description: '',
                category: '',
                price: '',
                rentalDuration: 'hours',
                condition: 'good',
                images: [],
                specs: [],
              });
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to list item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: colors.surface,
        borderBottomColor: colors.border 
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Rent Out Your Item</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Product Images *</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Add clear photos of your item</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
            {/* Add Image Buttons */}
            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity style={[styles.addImageButton, { borderColor: colors.primary }]} onPress={pickImage}>
                <Ionicons name="image-outline" size={32} color={colors.primary} />
                <Text style={[styles.addImageText, { color: colors.primary }]}>Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.addImageButton, { borderColor: colors.primary }]} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={32} color={colors.primary} />
                <Text style={[styles.addImageText, { color: colors.primary }]}>Camera</Text>
              </TouchableOpacity>
            </View>

            {/* Selected Images */}
            {form.images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.selectedImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Basic Information */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
          
          {/* Product Name */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Product Name *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text 
              }]}
              placeholder="e.g., MacBook Pro M2, iPhone 15 Pro"
              placeholderTextColor={colors.placeholder}
              value={form.name}
              onChangeText={(text) => setForm(prev => ({ ...prev, name: text }))}
            />
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text 
              }]}
              placeholder="Describe your item's features, condition, and any included accessories..."
              placeholderTextColor={colors.placeholder}
              value={form.description}
              onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Category */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: colors.inputBackground, borderColor: colors.border },
                    form.category === category && [styles.selectedCategoryButton, { borderColor: colors.primary, backgroundColor: colors.categoryIcon }]
                  ]}
                  onPress={() => setForm(prev => ({ ...prev, category }))}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    { color: colors.textSecondary },
                    form.category === category && [styles.selectedCategoryButtonText, { color: colors.primary }]
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Rental Details */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rental Details</Text>
          
          {/* Price */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Rental Price *</Text>
            <View style={styles.priceContainer}>
              <Text style={[styles.currencySymbol, { color: colors.text }]}>₱</Text>
              <TextInput
                style={[styles.input, styles.priceInput, { 
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text 
                }]}
                placeholder="0.00"
                placeholderTextColor={colors.placeholder}
                value={form.price}
                onChangeText={(text) => setForm(prev => ({ ...prev, price: text }))}
                keyboardType="decimal-pad"
              />
              <View style={[styles.rentalDurationContainer, { backgroundColor: colors.rateBadge, borderColor: colors.primary }]}>
                <Text style={[styles.rentalDurationText, { color: colors.primary }]}>per {form.rentalDuration}</Text>
              </View>
            </View>
          </View>

          {/* Rental Duration */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Rental Duration</Text>
            <View style={styles.durationButtons}>
              {(['hours', 'days', 'weeks'] as const).map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton,
                    { backgroundColor: colors.inputBackground, borderColor: colors.border },
                    form.rentalDuration === duration && [styles.selectedDurationButton, { borderColor: colors.primary, backgroundColor: colors.categoryIcon }]
                  ]}
                  onPress={() => setForm(prev => ({ ...prev, rentalDuration: duration }))}
                >
                  <Text style={[
                    styles.durationButtonText,
                    { color: colors.textSecondary },
                    form.rentalDuration === duration && [styles.selectedDurationButtonText, { color: colors.primary }]
                  ]}>
                    {duration.charAt(0).toUpperCase() + duration.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Condition */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Item Condition</Text>
            <View style={styles.conditionButtons}>
              {(['excellent', 'good', 'fair'] as const).map((condition) => (
                <TouchableOpacity
                  key={condition}
                  style={[
                    styles.conditionButton,
                    { backgroundColor: colors.inputBackground, borderColor: colors.border },
                    form.condition === condition && [styles.selectedConditionButton, { borderColor: colors.primary, backgroundColor: colors.categoryIcon }]
                  ]}
                  onPress={() => setForm(prev => ({ ...prev, condition }))}
                >
                  <Text style={[
                    styles.conditionButtonText,
                    { color: colors.textSecondary },
                    form.condition === condition && [styles.selectedConditionButtonText, { color: colors.primary }]
                  ]}>
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Specifications */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Specifications</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Add key specifications (e.g., RAM, Storage, Processor)</Text>
          
          {/* Add Spec Input */}
          <View style={styles.specInputContainer}>
            <TextInput
              style={[styles.input, styles.specInput, { 
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
                color: colors.text 
              }]}
              placeholder="e.g., 16GB RAM, 512GB SSD, Intel i7"
              placeholderTextColor={colors.placeholder}
              value={currentSpec}
              onChangeText={setCurrentSpec}
              onSubmitEditing={addSpec}
            />
            <TouchableOpacity style={[styles.addSpecButton, { backgroundColor: colors.primary }]} onPress={addSpec}>
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Specs List */}
          <View style={styles.specsContainer}>
            {form.specs.map((spec, index) => (
              <View key={index} style={[styles.specTag, { backgroundColor: colors.rateBadge, borderColor: colors.border }]}>
                <Text style={[styles.specText, { color: colors.primary }]}>{spec}</Text>
                <TouchableOpacity onPress={() => removeSpec(index)}>
                  <Ionicons name="close" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Listing Your Item...</Text>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>List Item for Rent</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  imagesContainer: {
    flexDirection: 'row',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    marginRight: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addImageText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryButton: {
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    marginRight: 12,
  },
  rentalDurationContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  rentalDurationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  durationButtons: {
    flexDirection: 'row',
  },
  durationButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  selectedDurationButton: {
    borderWidth: 1,
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedDurationButtonText: {
    fontWeight: '600',
  },
  conditionButtons: {
    flexDirection: 'row',
  },
  conditionButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  selectedConditionButton: {
    borderWidth: 1,
  },
  conditionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedConditionButtonText: {
    fontWeight: '600',
  },
  specInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  specInput: {
    flex: 1,
    marginRight: 8,
  },
  addSpecButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  specText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 6,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomSpace: {
    height: 20,
  },
});