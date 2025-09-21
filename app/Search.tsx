import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState(['waste collection', 'recycling center', 'composting tips']);
  const { reports, notifications } = useData();
  const { theme, isDark } = useTheme();

  const searchCategories = [
    { id: 'reports', title: 'My Reports', icon: 'document-text-outline' },
    { id: 'facilities', title: 'Facilities', icon: 'location-outline' },
    { id: 'education', title: 'Learning', icon: 'school-outline' },
    { id: 'community', title: 'Community', icon: 'people-outline' },
  ];

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = (query: string) => {
    const results = [];
    
    // Search in reports
    const reportResults = reports.filter(report => 
      report.type.toLowerCase().includes(query.toLowerCase()) ||
      report.description.toLowerCase().includes(query.toLowerCase()) ||
      report.location.toLowerCase().includes(query.toLowerCase())
    ).map(report => ({
      id: report.id,
      title: `${report.type} Report`,
      subtitle: report.location,
      type: 'report',
      data: report
    }));
    
    // Search in notifications
    const notificationResults = notifications.filter(notification =>
      notification.title.toLowerCase().includes(query.toLowerCase()) ||
      notification.message.toLowerCase().includes(query.toLowerCase())
    ).map(notification => ({
      id: notification.id,
      title: notification.title,
      subtitle: notification.message,
      type: 'notification',
      data: notification
    }));

    // Add mock facility results
    const facilityResults = [
      { id: 'f1', title: 'Recycling Center Jabalpur', subtitle: 'Ranjhi Sector', type: 'facility' },
      { id: 'f2', title: 'Waste Collection Point', subtitle: '2.3 km away', type: 'facility' },
    ].filter(facility => 
      facility.title.toLowerCase().includes(query.toLowerCase()) ||
      facility.subtitle.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults([...reportResults, ...notificationResults, ...facilityResults]);
  };

  const handleResultPress = (result: any) => {
    switch (result.type) {
      case 'report':
        router.back();
        setTimeout(() => router.push('/(tabs)/reports'), 100);
        break;
      case 'notification':
        router.back();
        setTimeout(() => router.push('/Notification'), 100);
        break;
      case 'facility':
        router.back();
        setTimeout(() => router.push('/(tabs)/index'), 100);
        break;
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    switch (categoryId) {
      case 'reports':
        router.back();
        setTimeout(() => router.push('/(tabs)/reports'), 100);
        break;
      case 'facilities':
        router.back();
        setTimeout(() => router.push('/(tabs)/index'), 100);
        break;
      case 'education':
        router.back();
        setTimeout(() => router.push('/(tabs)/index'), 100);
        break;
      case 'community':
        router.back();
        setTimeout(() => router.push('/(tabs)/explore'), 100);
        break;
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'report': return 'document-text-outline';
      case 'notification': return 'notifications-outline';
      case 'facility': return 'location-outline';
      default: return 'search-outline';
    }
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity 
      style={[styles.resultItem, { backgroundColor: theme.card }]}
      onPress={() => handleResultPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.resultIcon, { backgroundColor: `${theme.primary}15` }]}>
        <Ionicons 
          name={getResultIcon(item.type)} 
          size={20} 
          color={theme.primary} 
        />
      </View>
      <View style={styles.resultContent}>
        <Text style={[styles.resultTitle, { color: theme.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.resultSubtitle, { color: theme.textSecondary }]}>
          {item.subtitle}
        </Text>
      </View>
      <Ionicons 
        name="chevron-forward-outline" 
        size={18} 
        color={theme.textSecondary} 
      />
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.categoryItem, { backgroundColor: theme.card }]}
      onPress={() => handleCategoryPress(item.id)}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={item.icon} 
        size={24} 
        color={theme.primary} 
        style={styles.categoryIcon}
      />
      <Text style={[styles.categoryTitle, { color: theme.text }]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Search',
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
        }} 
      />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Search Input */}
        <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
          <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search reports, facilities, tips..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search Results */}
        {searchQuery.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.resultsContainer}
            ListEmptyComponent={
              <View style={styles.emptyResults}>
                <Ionicons name="search-outline" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No results found for &quot;{searchQuery}&quot;
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                  Try searching for reports, facilities, or educational content
                </Text>
              </View>
            }
          />
        ) : (
          <View style={styles.searchHome}>
            {/* Quick Search Categories */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Quick Search
            </Text>
            <FlatList
              data={searchCategories}
              renderItem={renderCategoryItem}
              numColumns={2}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            />

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Recent Searches
                </Text>
                <View style={styles.recentSearches}>
                  {recentSearches.map((search, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.recentSearchItem, { backgroundColor: theme.card }]}
                      onPress={() => setSearchQuery(search)}
                    >
                      <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                      <Text style={[styles.recentSearchText, { color: theme.text }]}>
                        {search}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  searchHome: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoryItem: {
    flex: 1,
    padding: 16,
    margin: 6,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  categoryIcon: {
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  recentSearches: {
    gap: 8,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  recentSearchText: {
    fontSize: 14,
  },
  resultsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
  },
  emptyResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
