import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Image, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';

export default function ReportsScreen() {
  const { theme, isDark } = useTheme();
  const { user, reports, updateReportStatus } = useData();
  const styles = createStyles(theme);
  const [activeFilter, setActiveFilter] = useState('all');

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

  const getSeverityColor = (severity?: string) => {
    if (!severity) return theme.textSecondary;
    switch (severity.toLowerCase()) {
      case 'severe': return '#dc2626';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return theme.textSecondary;
    }
  };

  const handleReportAction = (reportId: string, currentStatus: string) => {
    const actions = [];
    
    if (currentStatus === 'pending') {
      actions.push({
        text: 'Mark In Progress',
        action: () => updateReportStatus(reportId, 'in-progress', 'Worker #' + Math.floor(Math.random() * 999))
      });
    }
    
    if (currentStatus === 'in-progress') {
      actions.push({
        text: 'Mark Completed',
        action: () => updateReportStatus(reportId, 'completed', undefined, new Date().toLocaleDateString())
      });
    }

    actions.push({
      text: 'View Details',
      action: () => {
        const report = reports.find(r => r.id === reportId);
        if (report) {
          showReportDetails(report);
        }
      }
    });

    if (Platform.OS === 'web') {
      const options = actions.map((action, index) => `${index + 1}. ${action.text}`).join('\n');
      const choice = prompt(`📋 Report Actions:\n\n${options}\n\nSelect option (1-${actions.length}):`);
      const actionIndex = parseInt(choice || '0') - 1;
      
      if (actionIndex >= 0 && actionIndex < actions.length) {
        actions[actionIndex].action();
      }
    } else {
      Alert.alert(
        'Report Actions',
        'Choose an action:',
        [
          ...actions.map(action => ({
            text: action.text,
            onPress: action.action
          })),
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const showReportDetails = (report: any) => {
    let details = `📋 Report Details:\n\n` +
      `🗑️ Type: ${report.type}\n` +
      `📍 Location: ${report.location}\n` +
      `📝 Description: ${report.description}\n` +
      `📅 Date: ${report.date}\n` +
      `⏰ Time: ${report.time}\n` +
      `📊 Status: ${report.status}`;

    if (report.assignedTo) {
      details += `\n👷 Assigned: ${report.assignedTo}`;
    }
    
    if (report.completedDate) {
      details += `\n✅ Completed: ${report.completedDate}`;
    }

    // Add analysis details if available
    if (report.analysis) {
      details += `\n\n🔬 AI Analysis:\n` +
        `• Waste Type: ${report.analysis.wasteType}\n` +
        `• Urgency: ${report.analysis.urgency}\n` +
        `• Severity: ${report.analysis.severity}\n` +
        `• Segregation: ${report.analysis.segregationLevel}\n\n` +
        `📝 Analysis Details:\n${report.analysis.reasoning}`;

      if (report.analysis.segregationReasoning) {
        details += `\n\n♻️ Segregation Notes:\n${report.analysis.segregationReasoning}`;
      }
    }

    if (Platform.OS === 'web') {
      alert(details);
    } else {
      Alert.alert('Report Details', details);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Reports</Text>
          <Text style={styles.subtitle}>Track your waste reports & analysis</Text>
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
              filteredReports
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((report) => (
                <TouchableOpacity 
                  key={report.id} 
                  style={styles.reportCard}
                  onPress={() => handleReportAction(report.id, report.status)}
                >
                  <View style={styles.reportHeader}>
                    <View style={styles.reportInfo}>
                      <Text style={styles.reportType}>{report.type}</Text>
                      <Text style={styles.reportLocation}>📍 {report.location}</Text>
                      <Text style={styles.reportDate}>
                        📅 {report.date} at {report.time}
                      </Text>
                    </View>
                    <View style={styles.reportImage}>
                      <Image source={{ uri: report.photoUri }} style={styles.image} />
                    </View>
                  </View>

                  <Text style={styles.reportDescription} numberOfLines={2}>
                    {report.description}
                  </Text>

                  {/* Analysis Section */}
                  {report.analysis && (
                    <View style={styles.analysisSection}>
                      <View style={styles.analysisHeader}>
                        <Ionicons name="analytics" size={16} color={theme.primary} />
                        <Text style={styles.analysisTitle}>AI Analysis</Text>
                      </View>
                      
                      <View style={styles.analysisContent}>
                        <View style={styles.analysisRow}>
                          <Text style={styles.analysisLabel}>Waste Type:</Text>
                          <Text style={styles.analysisValue}>{report.analysis.wasteType}</Text>
                        </View>
                        
                        <View style={styles.analysisRow}>
                          <Text style={styles.analysisLabel}>Severity:</Text>
                          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(report.analysis.severity) + '20' }]}>
                            <Text style={[styles.severityText, { color: getSeverityColor(report.analysis.severity) }]}>
                              {report.analysis.severity}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.analysisRow}>
                          <Text style={styles.analysisLabel}>Urgency:</Text>
                          <Text style={[styles.analysisValue, { color: theme.warning }]}>{report.analysis.urgency}</Text>
                        </View>
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.viewAnalysisButton}
                        onPress={() => showReportDetails(report)}
                      >
                        <Text style={styles.viewAnalysisText}>View Full Analysis</Text>
                        <Ionicons name="chevron-forward" size={16} color={theme.primary} />
                      </TouchableOpacity>
                    </View>
                  )}

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

                    <TouchableOpacity style={styles.actionIcon}>
                      <Ionicons name="ellipsis-horizontal" size={16} color={theme.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {report.assignedTo && (
                    <View style={styles.assignedInfo}>
                      <Ionicons name="person" size={14} color={theme.warning} />
                      <Text style={styles.assignedText}>
                        Assigned to: {report.assignedTo}
                      </Text>
                    </View>
                  )}

                  {report.completedDate && (
                    <View style={styles.completedInfo}>
                      <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                      <Text style={styles.completedText}>
                        Completed on {report.completedDate}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={64} color={theme.textSecondary} />
                <Text style={styles.emptyTitle}>
                  {activeFilter === 'all' 
                    ? 'No Reports Yet' 
                    : `No ${activeFilter.replace('-', ' ')} Reports`
                  }
                </Text>
                <Text style={styles.emptyText}>
                  {activeFilter === 'all' 
                    ? 'Submit your first waste report from the Home tab to get started!'
                    : `You don't have any ${activeFilter.replace('-', ' ')} reports yet.`
                  }
                </Text>
                
                {activeFilter === 'all' && (
                  <TouchableOpacity 
                    style={styles.emptyButton}
                    onPress={() => {
                      if (Platform.OS === 'web') {
                        alert('📱 Go to the Home tab and click "Submit Waste Report" to create your first report!');
                      } else {
                        Alert.alert('Get Started', 'Go to the Home tab and click "Submit Waste Report" to create your first report!');
                      }
                    }}
                  >
                    <Ionicons name="add" size={20} color="#ffffff" />
                    <Text style={styles.emptyButtonText}>Submit First Report</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Summary Stats */}
          {reports.length > 0 && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Report Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Ionicons name="document-text" size={24} color={theme.primary} />
                  <Text style={styles.summaryNumber}>{reports.length}</Text>
                  <Text style={styles.summaryLabel}>Total Reports</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                  <Text style={[styles.summaryNumber, { color: theme.success }]}>
                    {reports.filter(r => r.status === 'completed').length}
                  </Text>
                  <Text style={styles.summaryLabel}>Completed</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Ionicons name="analytics" size={24} color="#8b5cf6" />
                  <Text style={[styles.summaryNumber, { color: "#8b5cf6" }]}>
                    {reports.filter(r => r.analysis).length}
                  </Text>
                  <Text style={styles.summaryLabel}>Analyzed</Text>
                </View>
              </View>
            </View>
          )}
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
    paddingBottom: 30,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
  },
  activeFilterTab: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.text,
  },
  activeFilterTabText: {
    color: '#ffffff',
  },
  filterBadge: {
    backgroundColor: theme.textSecondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  activeFilterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    marginBottom: 20,
  },
  reportCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 2,
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
    resizeMode: 'cover',
  },
  reportDescription: {
    fontSize: 14,
    color: theme.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  
  // Analysis Section Styles
  analysisSection: {
    backgroundColor: theme.primary + '10',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.primary + '20',
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
  },
  analysisContent: {
    gap: 6,
    marginBottom: 8,
  },
  analysisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  analysisLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  analysisValue: {
    fontSize: 12,
    color: theme.text,
    fontWeight: '600',
    maxWidth: 150,
    textAlign: 'right',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  viewAnalysisText: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '600',
  },
  
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionIcon: {
    padding: 4,
  },
  assignedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 6,
  },
  assignedText: {
    fontSize: 12,
    color: theme.warning,
    fontWeight: '500',
  },
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    gap: 6,
  },
  completedText: {
    fontSize: 12,
    color: theme.success,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  summarySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
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
    shadowRadius: 2,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});
