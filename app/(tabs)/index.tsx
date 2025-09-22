import { StatusBar } from "expo-status-bar";
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
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useData } from "../../contexts/DataContext";
import EducationalContent from "../../components/EducationalContent";
import NearbyFacilitiesMap from "../../components/NearbyFacilitiesMap";

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { theme, isDark } = useTheme();
  const { user, submitReport } = useData();
  const styles = createStyles(theme);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [reportLocation, setReportLocation] = useState<string>(
    "Location detecting..."
  );
  const [showEducationalContent, setShowEducationalContent] = useState(false);
  const [showNearbyFacilities, setShowNearbyFacilities] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  
  // Debug logs
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
    console.log("Platform.OS check:", Platform.OS === "web");

    if (Platform.OS === "web") {
      console.log("Web mode detected, showing demo");
      const demoImage =
        "https://via.placeholder.com/300x200/dc2626/ffffff?text=Camera+Demo+Report";
      setSelectedImage(demoImage);
      setReportLocation("Demo Location - Camera, Web Browser");

      console.log("Calling showReportDialog from camera");
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
      console.log("Web gallery mode detected");
      const demoImage =
        "https://via.placeholder.com/300x200/22c55e/ffffff?text=Gallery+Demo+Report";
      setSelectedImage(demoImage);
      setReportLocation("Demo Location - Gallery, Web Browser");

      console.log("Calling showReportDialog from gallery");
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
      // Use browser prompt for web
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

        console.log(`${selectedType} selected`);
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
      // Use Alert.alert for mobile
      Alert.alert(
        "Submit Waste Report",
        `Location: ${location}\n\nChoose waste type:`,
        [
          {
            text: "General Waste",
            onPress: () =>
              submitWasteReport(
                photoUri,
                location,
                "General Waste",
                "Mixed waste requiring pickup"
              ),
          },
          {
            text: "Medical Waste",
            onPress: () =>
              submitWasteReport(
                photoUri,
                location,
                "Medical Waste",
                "Medical waste requiring special handling"
              ),
          },
          {
            text: "Electronic Waste",
            onPress: () =>
              submitWasteReport(
                photoUri,
                location,
                "Electronic Waste",
                "Electronic items for proper disposal"
              ),
          },
          {
            text: "Construction Debris",
            onPress: () =>
              submitWasteReport(
                photoUri,
                location,
                "Construction Debris",
                "Construction materials blocking area"
              ),
          },
          { text: "Cancel", style: "cancel" },
        ]
      );
    }
  };

  const submitWasteReport = async (
    photoUri: string,
    location: string,
    type: string,
    description: string
  ) => {
    console.log("submitWasteReport called with:", {
      photoUri,
      location,
      type,
      description,
    });
    console.log("Current user before submit:", user);

    try {
      console.log("About to call submitReport with analysis...");
      
      // Show loading state
      if (Platform.OS === "web") {
        // Can't show loading for web prompts, but we can console log
        console.log("🔍 Analyzing waste and submitting report...");
      } else {
        Alert.alert("Processing...", "Analyzing waste and submitting report...");
      }
      
      // Submit report and get analysis
      const result = await submitReport({
        type,
        location,
        description,
        photoUri,
      });

      console.log("submitReport completed successfully", result);

      // Store the analysis for display
      if (result.analysis) {
        setLastAnalysis(result.analysis);
      }

      // Show success with analysis if available
      if (result.analysis) {
        const analysisText = `🎯 AI Analysis Results:\n\n` +
          `🗑️ Waste Type: ${result.analysis.wasteType}\n` +
          `⚡ Urgency: ${result.analysis.urgency}\n` +
          `🔴 Severity: ${result.analysis.severity}\n` +
          `♻️ Segregation: ${result.analysis.segregationLevel}\n\n` +
          `📝 Analysis Details:\n${result.analysis.reasoning}\n\n` +
          `✅ Report submitted successfully!\n🏆 You earned 10 green coins!`;

        if (Platform.OS === "web") {
          alert(analysisText);
        } else {
          Alert.alert("Report Submitted with AI Analysis!", analysisText, [
            { 
              text: "View in Reports", 
              onPress: () => {
                // Navigate to reports tab if navigation is available
                console.log("Navigate to reports tab");
              }
            },
            { text: "OK" }
          ]);
        }
      } else {
        // Fallback message without analysis
        const successText = `Your ${type.toLowerCase()} report has been submitted successfully.\n\n🏆 You earned 10 green coins!\n\n⚠️ AI analysis was unavailable, but your report is being processed.`;
        
        if (Platform.OS === "web") {
          alert(`Report Submitted!\n\n${successText}\n\nCheck your reports tab for updates.`);
        } else {
          Alert.alert("Report Submitted!", successText, [{ text: "OK" }]);
        }
      }
    } catch (error) {
      console.log("submitWasteReport error:", error);

      // Hide loading and show error
      const errorMessage = "Failed to submit report. Please try again.\n\nNote: Analysis requires internet connection.";

      if (Platform.OS === "web") {
        alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert("Error", errorMessage);
      }
    }
  };

  const showPhotoOptions = () => {
    console.log("showPhotoOptions called");
    console.log("Platform.OS:", Platform.OS);

    if (Platform.OS === "web") {
      // Use browser confirm for web
      const choice = confirm(
        "Choose photo source:\n\nOK = Take Photo (Demo)\nCancel = Choose from Gallery (Demo)"
      );
      if (choice) {
        console.log("Take Photo selected");
        takePhoto();
      } else {
        console.log("Gallery selected");
        selectFromGallery();
      }
    } else {
      // Use Alert.alert for mobile
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
        contentContainerStyle={styles.scrollContent}
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
            <Text style={styles.heroSubtitle}>AI-Powered Smart Waste Management</Text>
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
              <Text style={styles.pointsEarned}>+10 Green Coins Earned! 🏆</Text>
              
              {lastAnalysis && (
                <View style={styles.analysisPreview}>
                  <View style={styles.analysisHeader}>
                    <Ionicons name="analytics" size={16} color="#8b5cf6" />
                    <Text style={styles.analysisTitle}>AI Analysis</Text>
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
                      if (Platform.OS === "web") {
                        alert(`Full AI Analysis:\n\n${lastAnalysis.reasoning}\n\nSegregation: ${lastAnalysis.segregationReasoning || 'N/A'}`);
                      } else {
                        Alert.alert(
                          "Full AI Analysis", 
                          `${lastAnalysis.reasoning}\n\nSegregation Notes:\n${lastAnalysis.segregationReasoning || 'No specific segregation notes available.'}`
                        );
                      }
                    }}
                  >
                    <Text style={styles.viewFullAnalysisText}>View Full Analysis</Text>
                    <Ionicons name="chevron-forward" size={16} color="#8b5cf6" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Enhanced Submit Report Button with AI Badge */}
        <View style={styles.primaryActionSection}>
          <TouchableOpacity
            style={styles.primaryReportButton}
            onPress={() => {
              console.log("Primary report button clicked!");
              showPhotoOptions();
            }}
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
                  <Text style={styles.reportButtonTitle}>Submit Waste Report</Text>
                  <Text style={styles.reportButtonTagline}>Get AI analysis within 10 seconds ⚡</Text>
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
                  alert(
                    "Find Bins feature coming soon!\n\nThis will show nearby waste bins on a map."
                  );
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
                if (Platform.OS === "web") {
                  alert(
                    "Check the Reports tab to track your submitted reports status and view AI analysis!"
                  );
                } else {
                  Alert.alert(
                    "Track Status",
                    "Check the Reports tab to track your submitted reports and view AI analysis."
                  );
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
              <View style={[styles.actionIconContainer, { backgroundColor: "#8b5cf6" + "20" }]}>
                <Ionicons name="school" size={24} color="#8b5cf6" />
              </View>
              <View style={styles.fullActionText}>
                <Text style={[styles.actionTitle, { color: "#8b5cf6" }]}>Learn & Educate</Text>
                <Text style={styles.actionSubtitle}>Waste management tips & guides</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8b5cf6" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fullWidthActionCard}
            onPress={() => setShowNearbyFacilities(true)}
          >
            <View style={styles.fullActionContent}>
              <View style={[styles.actionIconContainer, { backgroundColor: theme.primary + "20" }]}>
                <Ionicons name="map" size={24} color={theme.primary} />
              </View>
              <View style={styles.fullActionText}>
                <Text style={[styles.actionTitle, { color: theme.primary }]}>Find Facilities</Text>
                <Text style={styles.actionSubtitle}>Recycling centers & collection points</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.primary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fullWidthActionCard}
            onPress={() => {
              if (Platform.OS === "web") {
                alert(
                  `Your Current Rewards:\n\nPoints: ${
                    user?.points || 0
                  }\nReports: ${user?.reportsSubmitted || 0}\nLevel: ${
                    user?.level || "New User"
                  }\n\nKeep reporting to earn more rewards!`
                );
              } else {
                Alert.alert(
                  "Your Rewards",
                  `Points: ${user?.points || 0}\nReports: ${
                    user?.reportsSubmitted || 0
                  }\nLevel: ${user?.level || "New User"}`
                );
              }
            }}
          >
            <View style={styles.fullActionContent}>
              <View style={[styles.actionIconContainer, { backgroundColor: "#10b981" + "20" }]}>
                <Ionicons name="trophy" size={24} color="#10b981" />
              </View>
              <View style={styles.fullActionText}>
                <Text style={[styles.actionTitle, { color: "#10b981" }]}>Rewards & Achievements</Text>
                <Text style={styles.actionSubtitle}>View your eco-impact & badges</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#10b981" />
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
                <Text style={styles.statNumber}>{user?.reportsSubmitted || 0}</Text>
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

        {Platform.OS === "web" && (
          <View style={styles.webNotice}>
            <View style={styles.webNoticeIcon}>
              <Ionicons name="information-circle" size={20} color="#6b7280" />
            </View>
            <Text style={styles.webNoticeText}>
              Full camera, location, and AI analysis features available on mobile devices. Web version uses demo mode.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
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
      paddingBottom: 100,
    },
    
    // Enhanced Hero Section
    heroSection: {
      height: 280,
      position: 'relative',
      marginBottom: 24,
    },
    heroBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#3b82f6',
    },
    heroGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(59, 130, 246, 0.9)',
    },
    heroContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      position: 'relative',
      zIndex: 1,
    },
    appBadge: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    heroTitle: {
      fontSize: 36,
      fontWeight: '700',
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: 8,
      letterSpacing: -1,
    },
    heroSubtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    userGreeting: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    welcomeText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
      textAlign: 'center',
    },

    // Enhanced Latest Report Card with Analysis
    latestReportCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      marginHorizontal: 20,
      marginBottom: 24,
      overflow: 'hidden',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    reportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    reportStatusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#10b981' + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      gap: 6,
    },
    reportStatusText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#10b981',
    },
    reportTime: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    reportImage: {
      width: '100%',
      height: 200,
      resizeMode: 'cover',
    },
    reportDetails: {
      padding: 16,
      gap: 8,
    },
    reportLocation: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '500',
    },
    pointsEarned: {
      fontSize: 14,
      color: '#f59e0b',
      fontWeight: '600',
    },
    
    // Analysis Preview Section
    analysisPreview: {
      backgroundColor: '#8b5cf6' + '10',
      borderRadius: 12,
      padding: 12,
      marginTop: 8,
      borderWidth: 1,
      borderColor: '#8b5cf6' + '20',
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
      color: '#8b5cf6',
    },
    analysisContent: {
      gap: 4,
      marginBottom: 8,
    },
    analysisDetail: {
      fontSize: 12,
      color: theme.text,
      fontWeight: '500',
    },
    viewFullAnalysisButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6,
      gap: 4,
    },
    viewFullAnalysisText: {
      fontSize: 12,
      color: '#8b5cf6',
      fontWeight: '600',
    },

    // Enhanced Primary Report Button with AI Badge
    primaryActionSection: {
      paddingHorizontal: 20,
      marginBottom: 32,
    },
    primaryReportButton: {
      borderRadius: 24,
      overflow: 'hidden',
      shadowColor: '#dc2626',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
      position: 'relative',
    },
    reportButtonGradient: {
      backgroundColor: '#dc2626',
      paddingVertical: 24,
      paddingHorizontal: 24,
    },
    aiPoweredBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
      zIndex: 1,
    },
    aiPoweredText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#ffffff',
    },
    reportButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginTop: 16,
    },
    reportButtonIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    reportButtonText: {
      flex: 1,
    },
    reportButtonTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: 4,
    },
    reportButtonTagline: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '500',
    },
    reportButtonArrow: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Enhanced Quick Actions
    quickActionsSection: {
      paddingHorizontal: 20,
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 20,
      letterSpacing: -0.5,
    },
    actionGrid: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
    },
    actionCard: {
      flex: 1,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
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
      backgroundColor: '#3b82f6' + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    actionSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    fullActionText: {
      flex: 1,
    },

    // Enhanced Stats Section
    statsSection: {
      paddingHorizontal: 20,
      marginBottom: 32,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
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
      backgroundColor: '#3b82f6' + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    statContent: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
    },

    // Web Notice
    webNotice: {
      flexDirection: 'row',
      backgroundColor: '#f3f4f6',
      marginHorizontal: 20,
      padding: 16,
      borderRadius: 12,
      alignItems: 'flex-start',
      gap: 12,
    },
    webNoticeIcon: {
      marginTop: 2,
    },
    webNoticeText: {
      flex: 1,
      fontSize: 14,
      color: '#6b7280',
      lineHeight: 20,
    },
  });
