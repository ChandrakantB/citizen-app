import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function ReportsScreen() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);
  const [activeFilter, setActiveFilter] = useState('all');

  // Dummy reports data - replace with actual data from backend
  const reports = [
    {
      id: 1,
      type: 'General Waste',
      location: 'Main Street, Sector 12',
      date: '2024-09-20',
      time: '10:30 AM',
      status: 'completed',
      description: 'Overflowing garbage bin near bus stop',
      image: 'https://via.placeholder.com/100x100/dc2626/ffffff?text=Waste',
      assignedTo: 'Worker #123',
      completedDate: '2024-09-21'
    },
    {
      id: 2,
      type: 'Medical Waste',
      location: 'Hospital Road, Block A',
      date: '2024-09-19',
      time: '2:15 PM',
      status: 'in-progress',
      description: 'Medical waste disposal needed',
      image: 'https://via.placeholder.com/100x100/dc2626/ffffff?text=Medical',
      assignedTo: 'Worker #456',
      completedDate: null
    },
    {
      id: 3,
      type: 'Construction Debris',
      location: 'Building Site, Phase 2',
      date: '2024-09-18',
      time: '11:45 AM',
      status: 'pending',
      description: 'Construction waste blocking pathway',
      image: 'https://via.placeholder.com/100x100/f59e0b/ffffff?text=Construction',
      assignedTo: null,
      completedDate: null
    },
    {
      id: 4,
      type: 'Electronic Waste',
      location: 'Tech Park, Office Complex',
      date: '2024-09-17',
      time: '3:20 PM',
      status: 'completed',
      description: 'Old computers and electronics disposal',
      image: 'https://via.placeholder.com/100x100/3b82f6/ffffff?text=E-Waste',
      assignedTo: 'Worker #789',
      completedDate: '2024-09-18'
    },
  ];

  const filters = [
    { key: 'all', label: 'All', count: reports.length },
    { key: 'pending', label: 'Pending', count: reports.filter(r => r.status === 'pending').length },
    { key: 'in-progress', label: 'In Progress', count: reports.filter(r => r.status === 'in-progress').length },
    { key: 'completed', label: 'Completed', count: reports.filter(r => r.status === 'completed').length },
  ];

  const filteredReports = activeFilter === 'all' 
    ? reports 
    : reports.filter(report => report.status === activeFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.success;
      case 'in-progress': return theme.warning;
      case 'pending': return theme.textSecondary;
      default: return theme.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in-progress': return 'time';
      case 'pending': return 'hourglass';
      default: return 'help-circle';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Reports</Text>
          <Text style={styles.subtitle}>Track your waste reports</Text>
        </View>

        <View style={styles.content}>
          {/* Filter Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterTab,
                  activeFilter === filter.key && styles.activeFilterTab
                ]}
                onPress={() => setActiveFilter(filter.key)}
              >
                <Text style={[
                  styles.filterTabText,
                  activeFilter === filter.key && styles.activeFilterTabText
                ]}>
                  {filter.label}
                </Text>
                <View style={[
                  styles.filterBadge,
                  activeFilter === filter.key && styles.activeFilterBadge
                ]}>
                  <Text style={[
                    styles.filterBadgeText,
                    activeFilter === filter.key && styles.activeFilterBadgeText
                  ]}>
                    {filter.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Reports List */}
          <View style={styles.reportsSection}>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <View key={report.id} style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <View style={styles.reportInfo}>
                      <Text style={styles.reportType}>{report.type}</Text>
                      <Text style={styles.reportLocation}>📍 {report.location}</Text>
                      <Text style={styles.reportDate}>
                        {report.date} at {report.time}
                      </Text>
                    </View>
                    <View style={styles.reportImage}>
                      <Image source={{ uri: report.image }} style={styles.image} />
                    </View>
                  </View>

                  <Text style={styles.reportDescription} numberOfLines={2}>
                    {report.description}
                  </Text>

                  <View style={styles.reportFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
                      <Ionicons 
                        name={getStatusIcon(report.status) as any} 
                        size={14} 
                        color={getStatusColor(report.status)} 
                      />
                      <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('-', ' ')}
                      </Text>
                    </View>

                    {report.assignedTo && (
                      <Text style={styles.assignedText}>
                        Assigned to: {report.assignedTo}
                      </Text>
                    )}
                  </View>

                  {report.completedDate && (
                    <View style={styles.completedInfo}>
                      <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                      <Text style={styles.completedText}>
                        Completed on {report.completedDate}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={64} color={theme.textSecondary} />
                <Text style={styles.emptyTitle}>No Reports Found</Text>
                <Text style={styles.emptyText}>
                  {activeFilter === 'all' 
                    ? 'You haven\'t submitted any reports yet.'
                    : `No ${activeFilter.replace('-', ' ')} reports found.`
                  }
                </Text>
              </View>
            )}
          </View>

          {/* Summary Stats */}
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Report Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{reports.length}</Text>
                <Text style={styles.summaryLabel}>Total Reports</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryNumber, { color: theme.success }]}>
                  {reports.filter(r => r.status === 'completed').length}
                </Text>
                <Text style={styles.summaryLabel}>Resolved</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryNumber, { color: theme.warning }]}>
                  {reports.filter(r => r.status === 'in-progress').length}
                </Text>
                <Text style={styles.summaryLabel}>In Progress</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  content: {
    paddingBottom: 100,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  activeFilterTab: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
    marginRight: 8,
  },
  activeFilterTabText: {
    color: '#ffffff',
  },
  filterBadge: {
    backgroundColor: theme.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  activeFilterBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  activeFilterBadgeText: {
    color: '#ffffff',
  },
  reportsSection: {
    paddingHorizontal: 20,
  },
  reportCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
    marginRight: 12,
  },
  reportType: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  reportLocation: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  reportImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  reportDescription: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  assignedText: {
    fontSize: 11,
    color: theme.textSecondary,
    fontStyle: 'italic',
  },
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedText: {
    fontSize: 11,
    color: theme.success,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  summarySection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});
