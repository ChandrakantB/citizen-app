import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { WasteAnalysisResponse } from '../sevices/apiService';

interface AIAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  analysis: WasteAnalysisResponse | null;
  isAnalyzing: boolean;
  progress: number;
  reportType: string;
  location: string;
}

const { width, height } = Dimensions.get('window');

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  visible,
  onClose,
  analysis,
  isAnalyzing,
  progress,
  reportType,
  location,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(height));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation for AI analysis
      if (isAnalyzing) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.2,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, isAnalyzing]);

  // ✅ FIXED: Smooth progress bar animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300, // Smooth 300ms animation
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'high': return '#FF4444';
      case 'medium': return '#FF8C00';
      case 'low': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'severe': return 'warning';
      case 'moderate': return 'info';
      case 'minor': return 'check-circle';
      default: return 'help-circle';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View 
        style={[styles.overlay, { opacity: fadeAnim }]}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {isAnalyzing ? (
            // 🤖 AI Analysis In Progress UI
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.analyzingContainer}
            >
              <View style={styles.header}>
                <Text style={styles.headerTitle}>🤖 AI Analysis</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.analyzingContent}>
                <Animated.View 
                  style={[styles.aiIcon, { transform: [{ scale: pulseAnim }] }]}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
                    style={styles.aiIconGradient}
                  >
                    <Ionicons name="scan" size={40} color="#fff" />
                  </LinearGradient>
                </Animated.View>

                <Text style={styles.analyzingTitle}>Analyzing Your Waste</Text>
                <Text style={styles.analyzingSubtitle}>
                  AI is processing your image...
                </Text>

                {/* ✅ FIXED: Smooth animated progress bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View 
                      style={[
                        styles.progressFill,
                        { 
                          width: progressAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                            extrapolate: 'clamp',
                          })
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                </View>

                <View style={styles.analysisSteps}>
                  <View style={styles.stepItem}>
                    <Ionicons 
                      name={progress > 25 ? "checkmark-circle" : "ellipse-outline"} 
                      size={20} 
                      color={progress > 25 ? "#4CAF50" : "#fff"} 
                    />
                    <Text style={styles.stepText}>Image Processing</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <Ionicons 
                      name={progress > 50 ? "checkmark-circle" : "ellipse-outline"} 
                      size={20} 
                      color={progress > 50 ? "#4CAF50" : "#fff"} 
                    />
                    <Text style={styles.stepText}>Waste Classification</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <Ionicons 
                      name={progress > 75 ? "checkmark-circle" : "ellipse-outline"} 
                      size={20} 
                      color={progress > 75 ? "#4CAF50" : "#fff"} 
                    />
                    <Text style={styles.stepText}>Environmental Assessment</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <Ionicons 
                      name={progress > 90 ? "checkmark-circle" : "ellipse-outline"} 
                      size={20} 
                      color={progress > 90 ? "#4CAF50" : "#fff"} 
                    />
                    <Text style={styles.stepText}>Generating Insights</Text>
                  </View>
                </View>

                {/* ✅ FIXED: Dynamic wait time message */}
                <Text style={styles.waitTime}>
                  {progress < 30 ? "Analyzing image..." : 
                   progress < 60 ? "Classifying waste type..." :
                   progress < 90 ? "Calculating environmental impact..." :
                   "Finalizing analysis..."}
                </Text>
              </View>
            </LinearGradient>
          ) : analysis ? (
            // ✅ AI Analysis Results UI (unchanged)
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.resultsContainer}
            >
              <View style={styles.header}>
                <Text style={styles.headerTitle}>🎯 AI Analysis Complete!</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.resultsContent}>
                {/* Success Animation */}
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
                </View>

                {/* Main Analysis Card */}
                <View style={styles.analysisCard}>
                  <View style={styles.cardHeader}>
                    <MaterialIcons 
                      name={getSeverityIcon(analysis.severity)} 
                      size={24} 
                      color={getUrgencyColor(analysis.urgency)} 
                    />
                    <Text style={styles.wasteType}>{analysis.wasteType}</Text>
                  </View>

                  <View style={styles.urgencyBadge}>
                    <LinearGradient
                      colors={[getUrgencyColor(analysis.urgency), getUrgencyColor(analysis.urgency) + '80']}
                      style={styles.urgencyGradient}
                    >
                      <Text style={styles.urgencyText}>
                        {analysis.urgency?.toUpperCase()} PRIORITY
                      </Text>
                    </LinearGradient>
                  </View>

                  <View style={styles.severityRow}>
                    <Text style={styles.severityLabel}>Severity Level:</Text>
                    <Text style={[styles.severityValue, { color: getUrgencyColor(analysis.urgency) }]}>
                      {analysis.severity}
                    </Text>
                  </View>
                </View>

                {/* Detailed Analysis */}
                <View style={styles.detailsCard}>
                  <Text style={styles.sectionTitle}>🧠 AI Insights</Text>
                  <Text style={styles.reasoningText}>{analysis.reasoning}</Text>

                  <Text style={styles.sectionTitle}>♻️ Segregation Advice</Text>
                  <View style={styles.segregationRow}>
                    <Text style={styles.segregationLevel}>
                      Current Status: {analysis.segregationLevel}
                    </Text>
                  </View>
                  <Text style={styles.segregationAdvice}>
                    {analysis.segregationReasoning}
                  </Text>
                </View>

                {/* Report Info */}
                <View style={styles.reportInfo}>
                  <View style={styles.infoRow}>
                    <Ionicons name="location" size={16} color="#666" />
                    <Text style={styles.infoText}>{location}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="trash" size={16} color="#666" />
                    <Text style={styles.infoText}>{reportType}</Text>
                  </View>
                </View>

                {/* Points Earned */}
                <View style={styles.pointsCard}>
                  <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    style={styles.pointsGradient}
                  >
                    <Ionicons name="star" size={24} color="#fff" />
                    <Text style={styles.pointsText}>+15 Green Coins Earned!</Text>
                  </LinearGradient>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.viewReportsButton}
                    onPress={onClose}
                  >
                    <Text style={styles.viewReportsText}>View My Reports</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.closeResultsButton}
                    onPress={onClose}
                  >
                    <Text style={styles.closeResultsText}>Great!</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          ) : (
            // ❌ Analysis Failed UI (unchanged)
            <View style={styles.errorContainer}>
              <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: '#333' }]}>Report Submitted</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.errorContent}>
                <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
                <Text style={styles.errorTitle}>Report Saved Successfully!</Text>
                <Text style={styles.errorSubtitle}>
                  AI analysis was unavailable, but your report is safely stored.
                </Text>
                
                <View style={styles.pointsCard}>
                  <LinearGradient
                    colors={['#4CAF50', '#45a049']}
                    style={styles.pointsGradient}
                  >
                    <Ionicons name="star" size={24} color="#fff" />
                    <Text style={styles.pointsText}>+10 Green Coins Earned!</Text>
                  </LinearGradient>
                </View>

                <TouchableOpacity 
                  style={styles.closeResultsButton}
                  onPress={onClose}
                >
                  <Text style={styles.closeResultsText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};



const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: height * 0.9,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  
  // Analyzing UI Styles
  analyzingContainer: {
    paddingBottom: 30,
  },
  analyzingContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  aiIcon: {
    marginBottom: 20,
  },
  aiIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  analyzingSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 30,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  analysisSteps: {
    width: '100%',
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepText: {
    marginLeft: 12,
    color: '#fff',
    fontSize: 16,
  },
  waitTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontStyle: 'italic',
  },
  
  // Results UI Styles
  resultsContainer: {
    paddingBottom: 30,
  },
  resultsContent: {
    paddingHorizontal: 20,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 20,
  },
  analysisCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  wasteType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  urgencyBadge: {
    marginBottom: 15,
  },
  urgencyGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  urgencyText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  severityLabel: {
    fontSize: 16,
    color: '#666',
  },
  severityValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  reasoningText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  segregationRow: {
    marginBottom: 8,
  },
  segregationLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  segregationAdvice: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  reportInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  pointsCard: {
    marginBottom: 30,
  },
  pointsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 15,
  },
  pointsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewReportsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  viewReportsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeResultsButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  closeResultsText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Error UI Styles
  errorContainer: {
    backgroundColor: '#fff',
    paddingBottom: 30,
  },
  errorContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
});
