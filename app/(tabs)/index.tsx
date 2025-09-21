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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useData } from "../../contexts/DataContext";
import EducationalContent from "../../components/EducationalContent";
import NearbyFacilitiesMap from "../../components/NearbyFacilitiesMap";

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
      console.log("About to call submitReport...");
      await submitReport({
        type,
        location,
        description,
        photoUri,
      });

      console.log("submitReport completed successfully");

      if (Platform.OS === "web") {
        alert(
          `Report Submitted!\n\n${type} report submitted successfully.\nYou earned 10 points!\n\nCheck your stats and reports tab.`
        );
      } else {
        Alert.alert(
          "Report Submitted!",
          `Your ${type.toLowerCase()} report has been submitted successfully. You earned 10 points!`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.log("submitWasteReport error:", error);

      if (Platform.OS === "web") {
        alert("Error: Failed to submit report. Please try again.");
      } else {
        Alert.alert("Error", "Failed to submit report. Please try again.");
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
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Bin2Win</Text>
          <Text style={styles.subtitle}>Smart Waste Management</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.welcomeCard}>
            <Ionicons name="leaf" size={48} color={theme.success} />
            <Text style={styles.welcomeText}>
              Welcome back, {user?.name || "User"}!
            </Text>
            <Text style={styles.description}>
              Ready to make a positive impact on your community?
            </Text>
          </View>

          {selectedImage && (
            <View style={styles.photoPreview}>
              <Text style={styles.photoTitle}>Latest Report:</Text>
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImage}
              />
              <View style={styles.reportInfo}>
                <Text style={styles.reportStatus}>
                  Report Submitted Successfully
                </Text>
                <Text style={styles.reportLocation}>{reportLocation}</Text>
              </View>
            </View>
          )}

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <TouchableOpacity
              style={styles.reportButton}
              onPress={() => {
                console.log("Report button clicked!");
                showPhotoOptions();
              }}
            >
              <Ionicons name="camera" size={24} color="#ffffff" />
              <Text style={styles.reportButtonText}>Submit Waste Report</Text>
              <Ionicons name="chevron-forward" size={20} color="#ffffff" />
            </TouchableOpacity>

            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={styles.actionButton}
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
                <Ionicons name="location" size={24} color={theme.primary} />
                <Text style={styles.actionText}>Find Bins</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  if (Platform.OS === "web") {
                    alert(
                      "Check the Reports tab to track your submitted reports status!"
                    );
                  } else {
                    Alert.alert(
                      "Track Status",
                      "Check the Reports tab to track your submitted reports."
                    );
                  }
                }}
              >
                <Ionicons name="time" size={24} color={theme.warning} />
                <Text style={styles.actionText}>Track Status</Text>
              </TouchableOpacity>
            </View>

            {/* Educational Content Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: "#8b5cf6" + "20" },
              ]}
              onPress={() => setShowEducationalContent(true)}
            >
              <Ionicons name="book" size={24} color="#8b5cf6" />
              <Text style={[styles.actionText, { color: "#8b5cf6" }]}>
                Learn & Educate
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#8b5cf6" />
            </TouchableOpacity>

            {/* NEW: Nearby Facilities Map Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.primary + "20" },
              ]}
              onPress={() => setShowNearbyFacilities(true)}
            >
              <Ionicons name="map" size={24} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.primary }]}>
                Find Nearby Facilities
              </Text>
              <Ionicons name="chevron-forward" size={16} color={theme.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
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
              <Ionicons name="trophy" size={24} color={theme.success} />
              <Text style={styles.actionText}>View Rewards & Achievements</Text>
            </TouchableOpacity>
          </View>

          {/* User Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Impact Today</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons
                  name="document-text"
                  size={28}
                  color={theme.primary}
                />
                <Text style={styles.statNumber}>
                  {user?.reportsSubmitted || 0}
                </Text>
                <Text style={styles.statLabel}>Reports Submitted</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="trophy" size={28} color={theme.warning} />
                <Text style={styles.statNumber}>{user?.points || 0}</Text>
                <Text style={styles.statLabel}>Points Earned</Text>
              </View>
            </View>
          </View>

          {Platform.OS === "web" && (
            <View style={styles.webNotice}>
              <Ionicons
                name="information-circle"
                size={20}
                color={theme.textSecondary}
              />
              <Text style={styles.webNoticeText}>
                Full camera and location features available on mobile devices. Web version uses demo mode.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Educational Content Modal */}
      <EducationalContent 
        visible={showEducationalContent}
        onClose={() => setShowEducationalContent(false)}
      />

      {/* NEW: Nearby Facilities Map Modal */}
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
    header: {
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 30,
      backgroundColor: theme.header,
    },
    appTitle: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#ffffff",
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: "#bfdbfe",
      textAlign: "center",
      marginTop: 5,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 30,
      paddingBottom: 100,
    },
    welcomeCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 30,
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      marginBottom: 30,
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: "600",
      color: theme.text,
      marginTop: 15,
      textAlign: "center",
    },
    description: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 10,
      lineHeight: 22,
    },
    photoPreview: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 15,
      marginBottom: 30,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    photoTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 10,
    },
    previewImage: {
      width: "100%",
      height: 200,
      borderRadius: 12,
      marginBottom: 10,
    },
    reportInfo: {
      gap: 4,
    },
    reportStatus: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.success,
    },
    reportLocation: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    quickActions: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 20,
    },
    reportButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.error,
      padding: 20,
      borderRadius: 16,
      marginBottom: 15,
      shadowColor: theme.error,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    reportButtonText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#ffffff",
      flex: 1,
      marginLeft: 15,
    },
    actionGrid: {
      flexDirection: "row",
      gap: 15,
      marginBottom: 15,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      padding: 20,
      borderRadius: 12,
      marginBottom: 15,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      flex: 1,
    },
    actionText: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.text,
      marginLeft: 15,
      flex: 1,
    },
    statsSection: {
      marginBottom: 30,
    },
    statsGrid: {
      flexDirection: "row",
      gap: 15,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.card,
      padding: 20,
      borderRadius: 12,
      alignItems: "center",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    statNumber: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 8,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: "center",
    },
    webNotice: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.warning + "20",
      padding: 15,
      borderRadius: 12,
      marginTop: 10,
    },
    webNoticeText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginLeft: 10,
      flex: 1,
    },
  });
