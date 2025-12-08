import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SearchBarProps {
  onSearchPress?: () => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearchPress, 
  placeholder = "Search User" 
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.searchInputContainer, { 
        backgroundColor: colors.surface,
        borderColor: colors.border,
        shadowColor: colors.shadow,
      }]}
      onPress={onSearchPress}
      activeOpacity={0.8}
    >
      <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />
      <View style={styles.searchInput}>
        <TextInput
          style={[styles.searchInputText, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          editable={false}
          pointerEvents="none"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
  },
  searchInputText: {
    fontSize: 16,
    padding: 0,
  },
});

export default SearchBar;