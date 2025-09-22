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
    
    try {
      const nameParts = userData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const locationData = await getUserLocationForSignup();
      
      const registrationPayload = {
        firstName,
        lastName,
        email: userData.email,
        password: userData.password,
        address: locationData,
        profileImage: "https://example.com/profile.jpg"
      };
      
      console.log('📤 Sending registration payload:', registrationPayload);
      
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
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('❌ Backend registration failed:', error);
      setIsOnline(false);
      
      try {
        const savedUsers = await Storage.getItem('users');
        const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];

        const existingUser = users.find(u => u.email === userData.email);
        if (existingUser) {
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

        return true;
      } catch (localError) {
        return false;
      }
    }
  };

  const submitReport = async (reportData: Omit<WasteReport, 'id' | 'userId' | 'date' | 'time' | 'status'>): Promise<{ success: boolean; analysis?: WasteAnalysisResponse }> => {
    if (!user) throw new Error('User not logged in');

    console.log('📋 Submitting report with analysis:', reportData.type);

    let analysisResult: WasteAnalysisResponse | undefined;
    
    // Try to get analysis from backend
    try {
      // Get current location for analysis
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        
        console.log('🔍 Requesting waste analysis...');
        analysisResult = await apiService.analyzeWaste({
          locationText: reportData.location,
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          imageFile: reportData.photoUri,
        });
        
        console.log('✅ Analysis received:', analysisResult);
        setIsOnline(true);
      }
    } catch (analysisError) {
      console.log('⚠️ Analysis failed, continuing without analysis:', analysisError);
      setIsOnline(false);
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
    };

    // Update local state
    const updatedReports = [...reports, localReport];
    setReports(updatedReports);
    await Storage.setItem('reports', JSON.stringify(updatedReports));

    // Update user stats
    const updatedUser: User = {
      ...user,
      reportsSubmitted: user.reportsSubmitted + 1,
      points: user.points + 10,
    };
    setUser(updatedUser);
    await Storage.setItem('user', JSON.stringify(updatedUser));

    // Add notification with analysis info
    const analysisMessage = analysisResult 
      ? `Analysis: ${analysisResult.wasteType} (${analysisResult.severity} priority). You earned 10 green coins!`
      : `Your ${reportData.type} waste report has been submitted. You earned 10 green coins!`;

    await addNotification({
      title: 'Report Submitted Successfully',
      message: analysisMessage,
      read: false,
      type: 'report',
      relatedId: localReport.id,
    });

    console.log('✅ Report submission completed');

    // Try to sync with backend
    try {
      const response = await apiService.submitReport({
        ...reportData,
        analysis: analysisResult,
      });
      
      if (response && (response.success || response.data)) {
        console.log('✅ Report synced with backend');
        setIsOnline(true);
      }
    } catch (syncError) {
      console.log('⚠️ Failed to sync report with backend:', syncError);
      setIsOnline(false);
    }

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
