import React, { createContext, useContext, useState, useEffect } from 'react';
import { Storage } from '../utils/storage';
import { apiService, WasteAnalysisResponse } from '../sevices/apiService';
import * as Location from 'expo-location';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  level: string;
  points: number;
  reportsSubmitted: number;
  avatar?: string;
  address?: string;
}

export interface WasteReport {
  id: string;
  userId: string;
  type: string;
  location: string;
  description: string;
  photoUri: string;
  date: string;
  time: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  completedDate?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  analysis?: WasteAnalysisResponse;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'report' | 'service' | 'community' | 'general';
  relatedId?: string;
}

interface DataContextType {
  user: User | null;
  reports: WasteReport[];
  notifications: Notification[];
  isAuthenticated: boolean;
  isOnline: boolean;
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (userData: Omit<User, 'id' | 'joinDate' | 'points' | 'reportsSubmitted'> & { password: string }) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  submitReport: (report: Omit<WasteReport, 'id' | 'userId' | 'date' | 'time' | 'status'>) => Promise<{ success: boolean; analysis?: WasteAnalysisResponse }>;
  updateReportStatus: (reportId: string, status: WasteReport['status'], assignedTo?: string, completedDate?: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  syncWithBackend: () => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    console.log('🚀 Initializing Bin2Win app...');
    try {
      const storedToken = await Storage.getItem('authToken');
      if (storedToken) {
        console.log('🔑 Found stored auth token');
        apiService.setAuthToken(storedToken);

        try {
          const response = await apiService.getUserProfile();
          if (response.user) {
            console.log('✅ Backend login successful');

            const userData: User = {
              id: response.user.id,
              name: `${response.user.firstName} ${response.user.lastName || ''}`.trim(),
              email: response.user.email,
              phone: response.user.phone || '',
              joinDate: new Date().toLocaleDateString(),
              level: 'Eco Warrior',
              points: 0,
              reportsSubmitted: 0,
            };

            setUser(userData);
            await Storage.setItem('user', JSON.stringify(userData));
            await syncUserData();
            setIsOnline(true);
          }
        } catch (error) {
          console.log('⚠️ Backend unavailable, using local data');
          setIsOnline(false);
          await loadLocalData();
        }
      } else {
        console.log('📱 No auth token, loading local data');
        await loadLocalData();
      }
    } catch (error) {
      console.log('❌ Initialization error:', error);
      setIsOnline(false);
      await loadLocalData();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalData = async () => {
    try {
      console.log('📂 Loading local data...');

      const savedUser = await Storage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log('👤 Local user loaded:', userData.name);
      }

      const savedReports = await Storage.getItem('reports');
      if (savedReports) {
        const reportsData = JSON.parse(savedReports);
        setReports(reportsData);
        console.log('📋 Local reports loaded:', reportsData.length);
      }

      const savedNotifications = await Storage.getItem('notifications');
      if (savedNotifications) {
        const notificationsData = JSON.parse(savedNotifications);
        setNotifications(notificationsData);
        console.log('🔔 Local notifications loaded:', notificationsData.length);
      }
    } catch (error) {
      console.log('❌ Error loading local data:', error);
    }
  };

  const syncUserData = async () => {
    if (!user) return;

    try {
      console.log('🔄 Syncing user data with backend...');

      try {
        const reportsResponse = await apiService.getUserReports();
        if (reportsResponse && reportsResponse.data) {
          setReports(reportsResponse.data || []);
          await Storage.setItem('reports', JSON.stringify(reportsResponse.data || []));
          console.log('📋 Reports synced:', reportsResponse.data?.length || 0);
        }
      } catch (reportsError) {
        console.log('⚠️ Reports endpoint not available yet, using local data');
      }

      try {
        const notificationsResponse = await apiService.getUserNotifications();
        if (notificationsResponse && notificationsResponse.data) {
          setNotifications(notificationsResponse.data || []);
          await Storage.setItem('notifications', JSON.stringify(notificationsResponse.data || []));
          console.log('🔔 Notifications synced:', notificationsResponse.data?.length || 0);
        }
      } catch (notifError) {
        console.log('⚠️ Notifications endpoint not available yet, using local data');
      }

      setIsOnline(true);
      console.log('✅ Data sync completed');
    } catch (error) {
      console.log('⚠️ Sync failed, working offline:', error);
      setIsOnline(false);
      await loadLocalData();
    }
  };

  const syncWithBackend = async (): Promise<void> => {
    if (user) {
      await syncUserData();
    }
  };

  const getUserLocationForSignup = async () => {
    try {
      console.log('📍 Getting user location for signup...');

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('⚠️ Location permission denied, using default location');
        return {
          addressLine: "Default address",
          latitude: 20.9898,
          longitude: 76.9898
        };
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 100,
      });

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address[0]) {
        const addr = address[0];
        const addressLine = `${addr.street || ''} ${addr.city || ''} ${addr.region || ''}`.trim() || "Current location";

        const locationData = {
          addressLine,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };

        console.log('✅ Real location obtained for signup:', locationData);
        return locationData;
      } else {
        return {
          addressLine: `Lat: ${location.coords.latitude.toFixed(4)}, Lng: ${location.coords.longitude.toFixed(4)}`,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
      }

    } catch (error) {
      console.log('⚠️ Error getting location:', error);
      return {
        addressLine: "Default address",
        latitude: 20.9898,
        longitude: 76.9898
      };
    }
  };

  const loginUser = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 Attempting login with backend for:', email);

    try {
      const response = await apiService.login(email, password);

      if (response.token && response.user) {
        console.log('✅ Backend login successful');

        apiService.setAuthToken(response.token);
        await Storage.setItem('authToken', response.token);

        const userData: User = {
          id: response.user.id,
          name: `${response.user.firstName} ${response.user.lastName || ''}`.trim(),
          email: response.user.email,
          phone: response.user.phone || '',
          joinDate: new Date().toLocaleDateString(),
          level: 'Eco Warrior',
          points: 0,
          reportsSubmitted: 0,
        };

        setUser(userData);
        await Storage.setItem('user', JSON.stringify(userData));
        await syncUserData();

        setIsOnline(true);
        return true;
      }

      return false;
    } catch (error) {
      console.log('⚠️ Backend login failed, trying demo mode:', error);
      setIsOnline(false);

      if (email === 'demo@bin2win.com' && password === 'password') {
        const demoUser: User = {
          id: 'demo-user-id',
          name: 'Demo User',
          email: 'demo@bin2win.com',
          phone: '+91 9876543210',
          joinDate: new Date().toLocaleDateString(),
          level: 'Eco Warrior',
          points: 85,
          reportsSubmitted: 0,
        };

        setUser(demoUser);
        await Storage.setItem('user', JSON.stringify(demoUser));

        await addNotification({
          title: 'Welcome to Bin2Win!',
          message: 'Start your eco-journey by submitting your first waste report',
          read: false,
          type: 'general',
        });

        return true;
      }

      return false;
    }
  };

  const registerUser = async (userData: Omit<User, 'id' | 'joinDate' | 'points' | 'reportsSubmitted'> & { password: string }): Promise<boolean> => {
    console.log('📝 Attempting registration with backend for:', userData.email);
    console.log('🔍 userData received:', userData);
    
    try {
      const nameParts = userData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const locationData = await getUserLocationForSignup();
      
      if (!userData.password) {
        console.log('❌ Password is missing from userData');
        throw new Error('Password is required for registration');
      }
      
      const registrationPayload = {
        firstName,
        lastName,
        email: userData.email,
        password: userData.password,
        address: {
          addressLine: locationData.addressLine,
          latitude: locationData.latitude,
          longitude: locationData.longitude
        },
        profileImage: "https://via.placeholder.com/150/0000FF/FFFFFF?text=User"
      };
      
      console.log('📤 Sending COMPLETE registration payload:', registrationPayload);
      console.log('🔍 Password check:', userData.password ? 'Present' : 'MISSING');
      
      const response = await apiService.register(registrationPayload);

      if (response.token && response.user) {
        console.log('✅ Backend registration successful');
        
        apiService.setAuthToken(response.token);
        await Storage.setItem('authToken', response.token);
        
        const newUser: User = {
          id: response.user.id,
          name: `${response.user.firstName} ${response.user.lastName || ''}`.trim(),
          email: response.user.email,
          phone: userData.phone || '',
          joinDate: new Date().toLocaleDateString(),
          level: 'Eco Rookie',
          points: 0,
          reportsSubmitted: 0,
          address: locationData.addressLine,
        };
        
        setUser(newUser);
        await Storage.setItem('user', JSON.stringify(newUser));
        
        await addNotification({
          title: 'Welcome to Bin2Win!',
          message: 'Your account has been created successfully. Start making a difference!',
          read: false,
          type: 'general',
        });
        
        setIsOnline(true);
        console.log('✅ Backend registration completed successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('❌ Backend registration failed:', error);
      setIsOnline(false);
      
      try {
        console.log('🔄 Attempting local registration fallback...');
        
        const savedUsers = await Storage.getItem('users');
        const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];

        const existingUser = users.find(u => u.email === userData.email);
        if (existingUser) {
          console.log('⚠️ User already exists locally');
          return false;
        }

        const newUser: User = {
          id: Date.now().toString(),
          name: userData.name,
          email: userData.email,
          phone: userData.phone || '',
          joinDate: new Date().toLocaleDateString(),
          level: 'Eco Rookie',
          points: 0,
          reportsSubmitted: 0,
        };

        users.push(newUser);
        await Storage.setItem('users', JSON.stringify(users));

        setUser(newUser);
        await Storage.setItem('user', JSON.stringify(newUser));

        await addNotification({
          title: 'Welcome to Bin2Win!',
          message: 'Your account has been created locally. Connect to internet to sync with cloud!',
          read: false,
          type: 'general',
        });

        console.log('✅ Local registration successful');
        return true;
      } catch (localError) {
        console.log('❌ Local registration failed:', localError);
        return false;
      }
    }
  };

  // ✅ ENHANCED SUBMIT REPORT WITH AI ANALYSIS + BACKEND SYNC VIA /api/cleanup
  const submitReport = async (reportData: Omit<WasteReport, 'id' | 'userId' | 'date' | 'time' | 'status'>): Promise<{ success: boolean; analysis?: WasteAnalysisResponse }> => {
    if (!user) throw new Error('User not logged in');

    console.log('📋 Starting report submission with AI analysis via /api/cleanup:', reportData.type);
    console.log('🔍 Report data validation:', {
      type: reportData.type,
      location: reportData.location,
      description: reportData.description,
      hasPhoto: !!reportData.photoUri,
      photoUri: reportData.photoUri?.substring(0, 50) + '...'
    });

    let analysisResult: WasteAnalysisResponse | undefined;
    
    // TRY TO GET AI ANALYSIS FIRST - USING /api/cleanup
    try {
      console.log('🔍 Step 1: Requesting location permission for AI analysis...');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        console.log('✅ Step 2: Getting current location...');
        const location = await Location.getCurrentPositionAsync({});
        
        console.log('📍 Step 3: Location obtained for analysis:', {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          locationText: reportData.location
        });
        
        console.log('🤖 Step 4: Starting AI analysis via /api/cleanup... (This may take 10-20 seconds)');
        const analysisStartTime = Date.now();
        
        const analysisData = {
          locationText: reportData.location || 'Unknown location',
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          imageFile: reportData.photoUri,
        };
        
        console.log('📤 Calling /api/cleanup for AI analysis:', {
          locationText: analysisData.locationText,
          lat: analysisData.lat,
          lng: analysisData.lng,
          hasImage: !!analysisData.imageFile,
          imageType: typeof analysisData.imageFile
        });
        
        // Call AI analysis via /api/cleanup
        analysisResult = await apiService.analyzeWaste(analysisData);
        
        const analysisEndTime = Date.now();
        const analysisDuration = ((analysisEndTime - analysisStartTime) / 1000).toFixed(1);
        
        console.log(`✅ Step 5: AI Analysis completed successfully via /api/cleanup in ${analysisDuration}s:`, {
          wasteType: analysisResult.wasteType,
          urgency: analysisResult.urgency,
          severity: analysisResult.severity,
          segregationLevel: analysisResult.segregationLevel
        });
        
        setIsOnline(true);
      } else {
        console.log('⚠️ Location permission denied, skipping AI analysis');
      }
    } catch (analysisError) {
      const errorMessage = analysisError?.message || 'Unknown error';
      
      if (errorMessage.includes('timeout')) {
        console.log('⏱️ AI Analysis timed out after 20 seconds via /api/cleanup');
      } else if (errorMessage.includes('Network request failed')) {
        console.log('🌐 Network/CORS issue detected with /api/cleanup endpoint');
      } else if (errorMessage.includes('Failed to fetch')) {
        console.log('📡 /api/cleanup endpoint unavailable');
      } else if (errorMessage.includes('Cannot POST /api/cleanup')) {
        console.log('🚫 /api/cleanup endpoint not found');
      } else {
        console.log('❌ AI Analysis error via /api/cleanup:', errorMessage);
      }
      
      console.log('🔍 Full analysis error details:', {
        message: analysisError?.message || 'No message',
        name: analysisError?.name || 'No name'
      });
      
      setIsOnline(false);
    }

    // Store coordinates for the report
    let reportCoordinates: { latitude: number; longitude: number } | undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        reportCoordinates = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
        console.log('📍 Report coordinates stored:', reportCoordinates);
      }
    } catch (coordError) {
      console.log('⚠️ Could not get coordinates for report:', coordError.message);
    }

    // Create local report with analysis
    const localReport: WasteReport = {
      ...reportData,
      id: Date.now().toString(),
      userId: user.id,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      analysis: analysisResult,
      coordinates: reportCoordinates,
    };

    console.log('💾 Step 6: Saving report locally with analysis status:', {
      id: localReport.id,
      type: localReport.type,
      location: localReport.location,
      hasAnalysis: !!localReport.analysis,
      analysisType: localReport.analysis?.wasteType || 'Analysis unavailable',
      analysisSeverity: localReport.analysis?.severity || 'N/A',
      analysisUrgency: localReport.analysis?.urgency || 'N/A',
      hasCoordinates: !!localReport.coordinates
    });

    // Update local state
    const updatedReports = [...reports, localReport];
    setReports(updatedReports);
    await Storage.setItem('reports', JSON.stringify(updatedReports));

    // Update user stats
    const bonusPoints = analysisResult ? 15 : 10;
    const updatedUser: User = {
      ...user,
      reportsSubmitted: user.reportsSubmitted + 1,
      points: user.points + bonusPoints,
    };
    setUser(updatedUser);
    await Storage.setItem('user', JSON.stringify(updatedUser));

    // Enhanced notification
    let notificationMessage: string;
    let notificationTitle: string;

    if (analysisResult) {
      notificationTitle = 'Report + AI Analysis Complete! 🎯';
      notificationMessage = `AI Analysis: ${analysisResult.wasteType} detected with ${analysisResult.severity.toLowerCase()} severity. Priority: ${analysisResult.urgency}. You earned ${bonusPoints} green coins!`;
    } else {
      notificationTitle = 'Report Submitted Successfully';
      notificationMessage = `Your ${reportData.type} report has been saved locally. AI analysis was unavailable. You earned ${bonusPoints} green coins!`;
    }

    await addNotification({
      title: notificationTitle,
      message: notificationMessage,
      read: false,
      type: 'report',
      relatedId: localReport.id,
    });

    console.log('✅ Step 7: Report submission completed with local storage');

    // ✅ UPDATED: Try backend sync via /api/cleanup (optional - creates duplicate but provides backup)
    try {
      console.log('🔄 Step 8: Attempting backend sync via /api/cleanup...');
      
      const cleanupSyncData = {
        type: reportData.type,
        location: reportData.location,
        description: reportData.description,
        photoUri: reportData.photoUri,
        analysis: analysisResult,
        coordinates: reportCoordinates,
      };
      
      console.log('📤 Syncing to /api/cleanup:', {
        type: cleanupSyncData.type,
        location: cleanupSyncData.location,
        hasAnalysis: !!cleanupSyncData.analysis,
        hasCoordinates: !!cleanupSyncData.coordinates,
        hasPhoto: !!cleanupSyncData.photoUri
      });
      
      const response = await apiService.submitReport(cleanupSyncData);
      
      if (response && (response._id || response.user || response.analysis)) {
        console.log('✅ Report successfully saved to backend via /api/cleanup');
        console.log('📊 Backend response:', {
          backendReportId: response._id,
          wasteType: response.analysis?.wasteType,
          urgency: response.analysis?.urgency,
          hasImageUrl: !!response.imageUrl
        });
        setIsOnline(true);
      }
    } catch (syncError) {
      const syncErrorMessage = syncError?.message || 'Unknown sync error';
      
      if (syncErrorMessage.includes('Cannot POST /api/cleanup')) {
        console.log('⚠️ Backend sync failed - /api/cleanup endpoint not found');
      } else if (syncErrorMessage.includes('Network request failed')) {
        console.log('🌐 Backend sync failed - network/CORS issue with /api/cleanup');
      } else if (syncErrorMessage.includes('401') || syncErrorMessage.includes('authentication')) {
        console.log('🔐 Backend sync failed - authentication required for /api/cleanup');
      } else if (syncErrorMessage.includes('Image file is required')) {
        console.log('📷 Backend sync failed - image file required for /api/cleanup');
      } else {
        console.log('⚠️ Backend sync failed via /api/cleanup:', syncErrorMessage);
      }
      
      console.log('📱 Report remains safely stored locally');
      setIsOnline(false);
    }

    // Final success summary
    const finalSummary = {
      reportSaved: true,
      reportId: localReport.id,
      aiAnalysisAvailable: !!analysisResult,
      analysisDetails: analysisResult ? {
        wasteType: analysisResult.wasteType,
        severity: analysisResult.severity,
        urgency: analysisResult.urgency
      } : null,
      pointsAwarded: bonusPoints,
      backendSynced: isOnline,
      syncEndpoint: '/api/cleanup',
      totalReportsSubmitted: updatedUser.reportsSubmitted,
      totalPoints: updatedUser.points,
      hasCoordinates: !!reportCoordinates
    };

    console.log('🎉 Final Summary:', finalSummary);

    return { success: true, analysis: analysisResult };
  };

  const updateReportStatus = async (
    reportId: string,
    status: WasteReport['status'],
    assignedTo?: string,
    completedDate?: string
  ): Promise<void> => {
    const updatedReports = reports.map(report =>
      report.id === reportId ? { ...report, status, assignedTo, completedDate } : report
    );
    setReports(updatedReports);
    await Storage.setItem('reports', JSON.stringify(updatedReports));

    const statusMessages = {
      'pending': 'Your report is pending review',
      'in-progress': 'Your report is being processed',
      'completed': 'Your report has been completed! You earned 5 bonus green coins!'
    };

    await addNotification({
      title: 'Report Status Updated',
      message: statusMessages[status],
      read: false,
      type: 'report',
      relatedId: reportId,
    });

    if (status === 'completed' && user) {
      const updatedUser: User = {
        ...user,
        points: user.points + 5,
      };
      setUser(updatedUser);
      await Storage.setItem('user', JSON.stringify(updatedUser));
    }

    try {
      await apiService.updateReportStatus(reportId, status);
      setIsOnline(true);
    } catch (error) {
      console.log('⚠️ Failed to sync report status:', error);
      setIsOnline(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    setNotifications(updatedNotifications);
    await Storage.setItem('notifications', JSON.stringify(updatedNotifications));

    try {
      await apiService.markNotificationAsRead(notificationId);
      setIsOnline(true);
    } catch (error) {
      setIsOnline(false);
    }
  };

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'timestamp'>): Promise<void> => {
    try {
      const newNotification: Notification = {
        ...notificationData,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
      };

      const updatedNotifications = [newNotification, ...notifications];
      setNotifications(updatedNotifications);
      await Storage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.log('❌ Error adding notification:', error);
      throw error;
    }
  };

  const updateUserProfile = async (userData: Partial<User>): Promise<void> => {
    if (!user) throw new Error('User not logged in');

    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    await Storage.setItem('user', JSON.stringify(updatedUser));

    try {
      const response = await apiService.updateUserProfile(userData);
      if (response && (response.success || response.user)) {
        setIsOnline(true);

        if (response.user) {
          const backendUser: User = {
            id: response.user.id,
            name: `${response.user.firstName} ${response.user.lastName || ''}`.trim(),
            email: response.user.email,
            phone: response.user.phone || user.phone,
            joinDate: user.joinDate,
            level: user.level,
            points: user.points,
            reportsSubmitted: user.reportsSubmitted,
          };
          setUser(backendUser);
          await Storage.setItem('user', JSON.stringify(backendUser));
        }
      }
    } catch (error) {
      setIsOnline(false);
    }
  };

  const logoutUser = async (): Promise<void> => {
    try {
      apiService.clearAuthToken();
      await Storage.removeItem('authToken');
      await Storage.removeItem('user');
      setUser(null);
      setReports([]);
      setNotifications([]);
    } catch (error) {
      console.log('❌ Logout error:', error);
      throw error;
    }
  };

  const isAuthenticated = user !== null;

  return (
    <DataContext.Provider value={{
      user,
      reports: user ? reports.filter(r => r.userId === user.id) : [],
      notifications: user ? notifications : [],
      isAuthenticated,
      isOnline,
      loginUser,
      registerUser,
      logoutUser,
      submitReport,
      updateReportStatus,
      markNotificationAsRead,
      addNotification,
      updateUserProfile,
      syncWithBackend,
      loading,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
