import { StatusBar } from "expo-status-bar";
import { useTabBarHeight } from "../../hooks/useTabBarHeight";

import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useData } from "../../contexts/DataContext";
import EducationalContent from "../../components/EducationalContent";
import NearbyFacilitiesMap from "../../components/NearbyFacilitiesMap";
import { AIAnalysisModal } from "../../components/AIAnalysisModal";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const { user, submitReport } = useData();
  const { contentBottomPadding } = useTabBarHeight();
  const styles = createStyles(theme);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [reportLocation, setReportLocation] = useState<string>(
    "Location detecting..."
  );
  const [showEducationalContent, setShowEducationalContent] = useState(false);
  const [showNearbyFacilities, setShowNearbyFacilities] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);

  // ✅ AI Analysis Modal State
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  type AnalysisResult = {
    wasteType: string;
    urgency: string;
    severity: string;
    reasoning: string;
    segregationLevel: string;
    segregationReasoning: string;
    id: string;
    createdAt: string;
  };

  type AnalysisState = {
    isAnalyzing: boolean;
    progress: number;
    analysis: AnalysisResult | null;
    reportType: string;
    location: string;
  };

  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isAnalyzing: false,
    progress: 0,
    analysis: null,
    reportType: "",
    location: "",
  });

  console.log("Home screen render - User:", user);
  console.log(
    "Home screen render - submitReport function:",
    typeof submitReport
  );

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return "Location permission denied";
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address[0]) {
        const addr = address[0];
        return `${addr.street || ""} ${addr.city || ""} ${
          addr.region || ""
        }`.trim();
      }
      return `${location.coords.latitude.toFixed(
        4
      )}, ${location.coords.longitude.toFixed(4)}`;
    } catch (error) {
      console.log("Location error:", error);
      return "Location unavailable";
    }
  };

  const takePhoto = async () => {
    console.log("takePhoto called");

    if (Platform.OS === "web") {
      const demoImage =
        "https://via.placeholder.com/300x200/dc2626/ffffff?text=Camera+Demo+Report";
      setSelectedImage(demoImage);
      setReportLocation("Demo Location - Camera, Web Browser");
      showReportDialog(demoImage, "Demo Location - Camera, Web Browser");
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Camera access is required to report waste"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      const location = await getCurrentLocation();
      setReportLocation(location);
      showReportDialog(result.assets[0].uri, location);
    }
  };

  const selectFromGallery = async () => {
    console.log("selectFromGallery called");

    if (Platform.OS === "web") {
      const demoImage =
        "https://via.placeholder.com/300x200/22c55e/ffffff?text=Gallery+Demo+Report";
      setSelectedImage(demoImage);
      setReportLocation("Demo Location - Gallery, Web Browser");
      showReportDialog(demoImage, "Demo Location - Gallery, Web Browser");
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Gallery access is required to select photos"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      const location = await getCurrentLocation();
      setReportLocation(location);
      showReportDialog(result.assets[0].uri, location);
    }
  };

  const showReportDialog = (photoUri: string, location: string) => {
    console.log("showReportDialog called with:", { photoUri, location });

    if (Platform.OS === "web") {
      const wasteTypes = [
        "General Waste",
        "Medical Waste",
        "Electronic Waste",
        "Construction Debris",
      ];
      const choice = prompt(
        `Location: ${location}\n\nChoose waste type:\n\n1. General Waste\n2. Medical Waste\n3. Electronic Waste\n4. Construction Debris\n\nEnter number (1-4):`
      );

      const typeIndex = parseInt(choice || "0") - 1;
      if (typeIndex >= 0 && typeIndex < wasteTypes.length) {
        const selectedType = wasteTypes[typeIndex];
        const descriptions = [
          "Mixed waste requiring pickup",
          "Medical waste requiring special handling",
          "Electronic items for proper disposal",
          "Construction materials blocking area",
        ];

        console.log(`${selectedType} selected - will show MODAL`);
        submitWasteReport(
          photoUri,
          location,
          selectedType,
          descriptions[typeIndex]
        );
      } else if (choice !== null) {
        alert("Invalid selection. Please try again.");
      }
    } else {
      Alert.alert(
        "Submit Waste Report",
        `Location: ${location}\n\nYour Feedback`,
        [
          {
            text: "General Waste",
            onPress: () => {
              console.log("General Waste selected - will show MODAL");
              submitWasteReport(
                photoUri,
                location,
                "General Waste",
                "Mixed waste requiring pickup"
              );
            },
          },
          {
            text: "Medical Waste",
            onPress: () => {
              console.log("Medical Waste selected - will show MODAL");
              submitWasteReport(
                photoUri,
                location,
                "Medical Waste",
                "Medical waste requiring special handling"
              );
            },
          },
          {
            text: "Electronic Waste",
            onPress: () => {
              console.log("Electronic Waste selected - will show MODAL");
              submitWasteReport(
                photoUri,
                location,
                "Electronic Waste",
                "Electronic items for proper disposal"
              );
            },
          },
          {
            text: "Construction Debris",
            onPress: () => {
              console.log("Construction Debris selected - will show MODAL");
              submitWasteReport(
                photoUri,
                location,
                "Construction Debris",
                "Construction materials blocking area"
              );
            },
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  // ✅ FIXED: Real-time progress tracking with actual API response
  const submitWasteReport = async (
    photoUri: string,
    location: string,
    type: string,
    description: string
  ) => {
    console.log("🚀 submitWasteReport started - REAL-TIME VERSION");

    // ✅ Show modal immediately
    setAnalysisState({
      isAnalyzing: true,
      progress: 0,
      analysis: null,
      reportType: type,
      location: location,
    });
    setShowAnalysisModal(true);

    console.log("🎨 Modal should be visible now");

    // ✅ FIXED: Real progress tracking with dynamic intervals
    let currentProgress = 0;
    let progressInterval: NodeJS.Timeout;
    let isCompleted = false;

    const updateProgress = () => {
      if (isCompleted) return;

      // ✅ Smart progress increment - faster initially, slower near end
      let increment;
      if (currentProgress < 30) {
        increment = Math.random() * 15 + 5; // 5-20% increments initially
      } else if (currentProgress < 70) {
        increment = Math.random() * 10 + 3; // 3-13% increments mid-way
      } else if (currentProgress < 90) {
        increment = Math.random() * 5 + 1; // 1-6% increments near end
      } else {
        increment = Math.random() * 2; // Very small increments after 90%
      }

      currentProgress = Math.min(currentProgress + increment, 98); // Cap at 98%

      setAnalysisState(prev => ({
        ...prev,
        progress: currentProgress,
      }));

      // ✅ Dynamic interval based on progress
      const nextInterval = currentProgress < 50 ? 600 : 1000;
      progressInterval = setTimeout(updateProgress, nextInterval);
    };

    // Start progress updates
    progressInterval = setTimeout(updateProgress, 300);

    try {
      const startTime = Date.now();

      // Submit report with AI analysis
      const result = await submitReport({
        type,
        location,
        description,
        photoUri,
      });

      // ✅ FIXED: Mark as completed and jump to 100%
      isCompleted = true;
      clearTimeout(progressInterval);

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Total process completed in ${totalTime}s:`, result);

      // Store analysis for preview
      if (result.analysis) {
        setLastAnalysis(result.analysis);
      }

      // ✅ Immediate jump to 100% when API responds
      setAnalysisState(prev => ({
        ...prev,
        isAnalyzing: false,
        progress: 100, // Instant 100% completion
        analysis: result.analysis ?? null,
      }));

      console.log("🎉 Modal updated with results - real-time progress fixed");

    } catch (error) {
      console.log("❌ submitWasteReport error:", error);
      
      // ✅ Clear interval and complete on error too
      isCompleted = true;
      clearTimeout(progressInterval);

      setAnalysisState(prev => ({
        ...prev,
        isAnalyzing: false,
        progress: 100, // Complete on error too
        analysis: null,
      }));

      console.log("⚠️ Modal updated with error state - real-time progress fixed");
    }
  };

  const showPhotoOptions = () => {
    console.log("showPhotoOptions called");

    if (Platform.OS === "web") {
      const choice = confirm(
        "Choose photo source:\n\nOK = Take Photo (Demo)\nCancel = Choose from Gallery (Demo)"
      );
      if (choice) {
        takePhoto();
      } else {
        selectFromGallery();
      }
    } else {
      Alert.alert("Report Waste", "How would you like to add a photo?", [
        { text: "Take Photo", onPress: () => takePhoto() },
        { text: "Choose from Gallery", onPress: () => selectFromGallery() },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: contentBottomPadding,
          },
        ]}
      >
        {/* Enhanced Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBackground}>
            <View style={styles.heroGradient} />
          </View>
          <View style={styles.heroContent}>
            <View style={styles.appBadge}>
              <Ionicons name="leaf" size={32} color="#ffffff" />
            </View>
            <Text style={styles.heroTitle}>Bin2Win</Text>
            <Text style={styles.heroSubtitle}>
              AI-Powered Smart Waste Management
            </Text>
            <View style={styles.userGreeting}>
              <Text style={styles.welcomeText}>
                Welcome back, {user?.name || "Eco Warrior"}! 👋
              </Text>
            </View>
          </View>
        </View>

        {/* Latest Report with Analysis Preview */}
        {selectedImage && (
          <View style={styles.latestReportCard}>
            <View style={styles.reportHeader}>
              <View style={styles.reportStatusBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.reportStatusText}>Report Submitted</Text>
              </View>
              <Text style={styles.reportTime}>Just now</Text>
            </View>
            <Image source={{ uri: selectedImage }} style={styles.reportImage} />
            <View style={styles.reportDetails}>
              <Text style={styles.reportLocation}>{reportLocation}</Text>
              <Text style={styles.pointsEarned}>
                +{lastAnalysis ? 15 : 10} Green Coins Earned! 🏆
              </Text>

              {lastAnalysis && (
                <View style={styles.analysisPreview}>
                  <View style={styles.analysisHeader}>
                    <Ionicons name="analytics" size={16} color="#8b5cf6" />
                    <Text style={styles.analysisTitle}>
                      AI Analysis Complete!
                    </Text>
                  </View>
                  <View style={styles.analysisContent}>
                    <Text style={styles.analysisDetail}>
                      🗑️ Type: {lastAnalysis.wasteType}
                    </Text>
                    <Text style={styles.analysisDetail}>
                      🔴 Severity: {lastAnalysis.severity}
                    </Text>
                    <Text style={styles.analysisDetail}>
                      ⚡ Urgency: {lastAnalysis.urgency}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewFullAnalysisButton}
                    onPress={() => {
                      setAnalysisState({
                        isAnalyzing: false,
                        progress: 100,
                        analysis: lastAnalysis,
                        reportType: "Previous Report",
                        location: reportLocation,
                      });
                      setShowAnalysisModal(true);
                    }}
                  >
                    <Text style={styles.viewFullAnalysisText}>
                      View Full Analysis
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#8b5cf6"
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Enhanced Submit Report Button */}
        <View style={styles.primaryActionSection}>
          <TouchableOpacity
            style={styles.primaryReportButton}
            onPress={showPhotoOptions}
            activeOpacity={0.8}
          >
            <View style={styles.reportButtonGradient}>
              <View style={styles.aiPoweredBadge}>
                <Ionicons name="flash" size={12} color="#ffffff" />
                <Text style={styles.aiPoweredText}>AI-Powered</Text>
              </View>
              <View style={styles.reportButtonContent}>
                <View style={styles.reportButtonIcon}>
                  <Ionicons name="camera" size={28} color="#ffffff" />
                </View>
                <View style={styles.reportButtonText}>
                  <Text style={styles.reportButtonTitle}>
                    Submit Waste Report
                  </Text>
                  <Text style={styles.reportButtonTagline}>
                    Get AI analysis within 10 seconds ⚡
                  </Text>
                </View>
                <View style={styles.reportButtonArrow}>
                  <Ionicons name="arrow-forward" size={24} color="#ffffff" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardPrimary]}
              onPress={() => {
                if (Platform.OS === "web") {
                  alert("Find Bins feature coming soon!");
                } else {
                  Alert.alert(
                    "Find Bins",
                    "This feature will show nearby waste bins on a map."
                  );
                }
              }}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="location" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.actionTitle}>Find Bins</Text>
              <Text style={styles.actionSubtitle}>Nearby locations</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardSecondary]}
              onPress={() => {
                if (lastAnalysis) {
                  setAnalysisState({
                    isAnalyzing: false,
                    progress: 100,
                    analysis: lastAnalysis,
                    reportType: "Recent Report",
                    location: reportLocation,
                  });
                  setShowAnalysisModal(true);
                } else {
                  if (Platform.OS === "web") {
                    alert("Submit a report first to see AI analysis!");
                  } else {
                    Alert.alert(
                      "AI Analysis",
                      "Submit a report first to see AI analysis!"
                    );
                  }
                }
              }}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="analytics" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.actionTitle}>AI Analysis</Text>
              <Text style={styles.actionSubtitle}>View insights</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.fullWidthActionCard}
            onPress={() => setShowEducationalContent(true)}
          >
            <View style={styles.fullActionContent}>
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: "#8b5cf6" + "20" },
                ]}
              >
                <Ionicons name="school" size={24} color="#8b5cf6" />
              </View>
              <View style={styles.fullActionText}>
                <Text style={[styles.actionTitle, { color: "#8b5cf6" }]}>
                  Learn & Educate
                </Text>
                <Text style={styles.actionSubtitle}>
                  Waste management tips & guides
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8b5cf6" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fullWidthActionCard}
            onPress={() => setShowNearbyFacilities(true)}
          >
            <View style={styles.fullActionContent}>
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: theme.primary + "20" },
                ]}
              >
                <Ionicons name="map" size={24} color={theme.primary} />
              </View>
              <View style={styles.fullActionText}>
                <Text style={[styles.actionTitle, { color: theme.primary }]}>
                  Find Facilities
                </Text>
                <Text style={styles.actionSubtitle}>
                  Recycling centers & collection points
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.primary}
              />
            </View>
          </TouchableOpacity>

          {/* ✅ NEW: GreenMitra Chatbot Card */}
          <TouchableOpacity
            style={styles.fullWidthActionCard}
            onPress={() => {
              router.push("/(tabs)/greenmitra");
            }}
          >
            <View style={styles.fullActionContent}>
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: "#10b981" + "20" },
                ]}
              >
                <Ionicons name="leaf" size={24} color="#10b981" />
              </View>
              <View style={styles.fullActionText}>
                <Text style={[styles.actionTitle, { color: "#10b981" }]}>
                  🌱 GreenMitra Chatbot
                </Text>
                <Text style={styles.actionSubtitle}>
                  AI waste classification assistant
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#10b981" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fullWidthActionCard}
            onPress={() => {
              router.push("/(tabs)/services");
            }}
          >
            <View style={styles.fullActionContent}>
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: "#f59e0b" + "20" },
                ]}
              >
                <Ionicons name="construct" size={24} color="#f59e0b" />
              </View>
              <View style={styles.fullActionText}>
                <Text style={[styles.actionTitle, { color: "#f59e0b" }]}>
                  More Services
                </Text>
                <Text style={styles.actionSubtitle}>
                  Explore all waste management tools
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#f59e0b" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Enhanced User Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Impact Today</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="document-text" size={24} color="#3b82f6" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>
                  {user?.reportsSubmitted || 0}
                </Text>
                <Text style={styles.statLabel}>Reports Submitted</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="trophy" size={24} color="#f59e0b" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{user?.points || 0}</Text>
                <Text style={styles.statLabel}>Green Coins</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="analytics" size={24} color="#8b5cf6" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>
                  {user?.reportsSubmitted || 0}
                </Text>
                <Text style={styles.statLabel}>AI Analyzed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Daily Eco Tips</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipCard}>
              <View style={styles.tipIcon}>
                <Ionicons name="leaf" size={20} color="#10b981" />
              </View>
              <Text style={styles.tipText}>
                Use GreenMitra chatbot to learn proper waste segregation for any
                item!
              </Text>
            </View>
            <View style={styles.tipCard}>
              <View style={styles.tipIcon}>
                <Ionicons name="refresh-outline" size={20} color="#3b82f6" />
              </View>
              <Text style={styles.tipText}>
                Clean containers before disposal to ensure better recycling
                quality.
              </Text>
            </View>
          </View>
        </View>

        {Platform.OS === "web" && (
          <View style={styles.webNotice}>
            <View style={styles.webNoticeIcon}>
              <Ionicons name="information-circle" size={20} color="#6b7280" />
            </View>
            <Text style={styles.webNoticeText}>
              Full camera, location, and AI analysis features available on
              mobile devices. Web version uses demo mode.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ✅ Beautiful AI Analysis Modal */}
      <AIAnalysisModal
        visible={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        analysis={analysisState.analysis}
        isAnalyzing={analysisState.isAnalyzing}
        progress={analysisState.progress}
        reportType={analysisState.reportType}
        location={analysisState.location}
      />

      {/* Existing Modals */}
      <EducationalContent
        visible={showEducationalContent}
        onClose={() => setShowEducationalContent(false)}
      />

      <NearbyFacilitiesMap
        visible={showNearbyFacilities}
        onClose={() => setShowNearbyFacilities(false)}
      />
    </SafeAreaView>
  );
}




const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100, // Base padding, will be overridden by contentBottomPadding
    },

    // Enhanced Hero Section
    heroSection: {
      height: 280,
      position: "relative",
      marginBottom: 24,
    },
    heroBackground: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#10b981", // Green instead of blue
    },
    heroGradient: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(16, 185, 129, 0.9)", // Green gradient
    },
    heroContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
      position: "relative",
      zIndex: 1,
    },
    appBadge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 2,
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    heroTitle: {
      fontSize: 36,
      fontWeight: "700",
      color: "#ffffff",
      textAlign: "center",
      marginBottom: 8,
      letterSpacing: -1,
    },
    heroSubtitle: {
      fontSize: 16,
      color: "rgba(255, 255, 255, 0.9)",
      textAlign: "center",
      marginBottom: 24,
      lineHeight: 22,
    },
    userGreeting: {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.2)",
    },
    welcomeText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#ffffff",
      textAlign: "center",
    },

    // Enhanced Latest Report Card with Analysis
    latestReportCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      marginHorizontal: 20,
      marginBottom: 24,
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    reportHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    reportStatusBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#10b981" + "20",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      gap: 6,
    },
    reportStatusText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#10b981",
    },
    reportTime: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    reportImage: {
      width: "100%",
      height: 200,
      resizeMode: "cover",
    },
    reportDetails: {
      padding: 16,
      gap: 8,
    },
    reportLocation: {
      fontSize: 14,
      color: theme.text,
      fontWeight: "500",
    },
    pointsEarned: {
      fontSize: 14,
      color: "#f59e0b",
      fontWeight: "600",
    },

    // Analysis Preview Section
    analysisPreview: {
      backgroundColor: "#8b5cf6" + "10",
      borderRadius: 12,
      padding: 12,
      marginTop: 8,
      borderWidth: 1,
      borderColor: "#8b5cf6" + "20",
    },
    analysisHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 6,
    },
    analysisTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: "#8b5cf6",
    },
    analysisContent: {
      gap: 4,
      marginBottom: 8,
    },
    analysisDetail: {
      fontSize: 12,
      color: theme.text,
      fontWeight: "500",
    },
    viewFullAnalysisButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 6,
      gap: 4,
    },
    viewFullAnalysisText: {
      fontSize: 12,
      color: "#8b5cf6",
      fontWeight: "600",
    },

    // Enhanced Primary Report Button
    primaryActionSection: {
      paddingHorizontal: 20,
      marginBottom: 32,
    },
    primaryReportButton: {
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: "#dc2626",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
      position: "relative",
    },
    reportButtonGradient: {
      backgroundColor: "#dc2626",
      paddingVertical: 24,
      paddingHorizontal: 24,
    },
    aiPoweredBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
      zIndex: 1,
    },
    aiPoweredText: {
      fontSize: 10,
      fontWeight: "600",
      color: "#ffffff",
    },
    reportButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginTop: 16,
    },
    reportButtonIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    reportButtonText: {
      flex: 1,
    },
    reportButtonTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#ffffff",
      marginBottom: 4,
    },
    reportButtonTagline: {
      fontSize: 14,
      color: "rgba(255, 255, 255, 0.9)",
      fontWeight: "500",
    },
    reportButtonArrow: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      justifyContent: "center",
      alignItems: "center",
    },

    // Quick Actions
    quickActionsSection: {
      paddingHorizontal: 20,
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 20,
      letterSpacing: -0.5,
    },
    actionGrid: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 16,
    },
    actionCard: {
      flex: 1,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    actionCardPrimary: {
      backgroundColor: theme.card,
    },
    actionCardSecondary: {
      backgroundColor: theme.card,
    },
    actionIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#3b82f6" + "20",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      textAlign: "center",
      marginBottom: 4,
    },
    actionSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 16,
    },
    fullWidthActionCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    fullActionContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    fullActionText: {
      flex: 1,
    },

    // Stats Section
    statsSection: {
      paddingHorizontal: 20,
      marginBottom: 32,
    },
    statsContainer: {
      flexDirection: "row",
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    statIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#3b82f6" + "20",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    statContent: {
      alignItems: "center",
    },
    statNumber: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: "center",
      fontWeight: "500",
    },

    // Tips Section
    tipsSection: {
      paddingHorizontal: 20,
      marginBottom: 32,
    },
    tipsContainer: {
      gap: 12,
    },
    tipCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    tipIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#10b981" + "20",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    tipText: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
      lineHeight: 18,
    },

    // Web Notice
    webNotice: {
      flexDirection: "row",
      backgroundColor: "#f3f4f6",
      marginHorizontal: 20,
      padding: 16,
      borderRadius: 12,
      alignItems: "flex-start",
      gap: 12,
    },
    webNoticeIcon: {
      marginTop: 2,
    },
    webNoticeText: {
      flex: 1,
      fontSize: 14,
      color: "#6b7280",
      lineHeight: 20,
    },
  });
