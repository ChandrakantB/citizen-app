import React, { createContext, useContext, useState, useEffect } from 'react';
import { Storage } from '../utils/storage';

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
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (userData: Omit<User, 'id' | 'joinDate' | 'points' | 'reportsSubmitted'>) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  submitReport: (report: Omit<WasteReport, 'id' | 'userId' | 'date' | 'time' | 'status'>) => Promise<void>;
  updateReportStatus: (reportId: string, status: WasteReport['status'], assignedTo?: string, completedDate?: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => Promise<void>;
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      await loadUserData();
      await loadReportsData();
      await loadNotificationsData();
    } catch (error) {
      console.log('Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const savedUser = await Storage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const loadReportsData = async () => {
    try {
      const savedReports = await Storage.getItem('reports');
      if (savedReports) {
        setReports(JSON.parse(savedReports));
      }
    } catch (error) {
      console.log('Error loading reports data:', error);
    }
  };

  const loadNotificationsData = async () => {
    try {
      const savedNotifications = await Storage.getItem('notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.log('Error loading notifications data:', error);
    }
  };

  const saveUserData = async (userData: User) => {
    try {
      await Storage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.log('Error saving user data:', error);
      throw error;
    }
  };

  const saveReportsData = async (reportsData: WasteReport[]) => {
    try {
      await Storage.setItem('reports', JSON.stringify(reportsData));
      setReports(reportsData);
    } catch (error) {
      console.log('Error saving reports data:', error);
      throw error;
    }
  };

  const saveNotificationsData = async (notificationsData: Notification[]) => {
    try {
      await Storage.setItem('notifications', JSON.stringify(notificationsData));
      setNotifications(notificationsData);
    } catch (error) {
      console.log('Error saving notifications data:', error);
      throw error;
    }
  };

  const loginUser = async (email: string, password: string): Promise<boolean> => {
    console.log('DataContext loginUser called with:', email, password);
    
    try {
      // Demo account check
      if (email === 'demo@bin2win.com' && password === 'password') {
        console.log('Demo account login detected');
        
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
        
        await saveUserData(demoUser);
        
        // Add welcome notification for demo user
        await addNotification({
          title: 'Welcome to Bin2Win!',
          message: 'Start your eco-journey by submitting your first waste report',
          read: false,
          type: 'general',
        });
        
        console.log('Demo user saved successfully');
        return true;
      }

      // Check registered users
      const savedUsers = await Storage.getItem('users');
      console.log('Saved users from storage:', savedUsers);
      
      const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];
      
      const foundUser = users.find(u => u.email === email);
      console.log('Found user:', foundUser);
      
      if (foundUser) {
        await saveUserData(foundUser);
        console.log('User logged in successfully');
        return true;
      }

      console.log('No user found with email:', email);
      return false;
    } catch (error) {
      console.log('Login error in DataContext:', error);
      return false;
    }
  };

  const registerUser = async (userData: Omit<User, 'id' | 'joinDate' | 'points' | 'reportsSubmitted'>): Promise<boolean> => {
    try {
      const savedUsers = await Storage.getItem('users');
      const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];

      // Check if user already exists
      const existingUser = users.find(u => u.email === userData.email);
      if (existingUser) {
        return false;
      }

      // Create new user
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        joinDate: new Date().toLocaleDateString(),
        level: 'Eco Rookie',
        points: 0,
        reportsSubmitted: 0,
      };

      // Save to users list
      users.push(newUser);
      await Storage.setItem('users', JSON.stringify(users));

      // Set as current user
      await saveUserData(newUser);

      // Add welcome notification
      await addNotification({
        title: 'Welcome to Bin2Win!',
        message: 'Your account has been created successfully. Start making a difference!',
        read: false,
        type: 'general',
      });

      return true;
    } catch (error) {
      console.log('Registration error:', error);
      return false;
    }
  };

  const logoutUser = async (): Promise<void> => {
    try {
      await Storage.removeItem('user');
      setUser(null);
      setNotifications([]);
    } catch (error) {
      console.log('Logout error:', error);
      throw error;
    }
  };

  const submitReport = async (reportData: Omit<WasteReport, 'id' | 'userId' | 'date' | 'time' | 'status'>): Promise<void> => {
    console.log('submitReport called with:', reportData);
    console.log('Current user:', user);
    
    if (!user) {
      console.log('No user found, throwing error');
      throw new Error('User not logged in');
    }

    try {
      const newReport: WasteReport = {
        ...reportData,
        id: Date.now().toString(),
        userId: user.id,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
      };

      console.log('Created new report:', newReport);

      const updatedReports = [...reports, newReport];
      await saveReportsData(updatedReports);

      console.log('Reports saved successfully');

      // Add notification for new report
      await addNotification({
        title: 'Report Submitted Successfully',
        message: `Your ${reportData.type} waste report has been submitted. You earned 10 points!`,
        read: false,
        type: 'report',
        relatedId: newReport.id,
      });

      // Update user stats
      const updatedUser: User = {
        ...user,
        reportsSubmitted: user.reportsSubmitted + 1,
        points: user.points + 10,
      };
      
      console.log('Updating user stats:', updatedUser);
      await saveUserData(updatedUser);
      console.log('User stats updated successfully');
      
    } catch (error) {
      console.log('Error submitting report:', error);
      throw error;
    }
  };

  const updateReportStatus = async (
    reportId: string, 
    status: WasteReport['status'], 
    assignedTo?: string, 
    completedDate?: string
  ): Promise<void> => {
    try {
      const updatedReports = reports.map(report => {
        if (report.id === reportId) {
          return {
            ...report,
            status,
            assignedTo,
            completedDate,
          };
        }
        return report;
      });

      await saveReportsData(updatedReports);

      // Add notification for status update
      const statusMessages = {
        'pending': 'Your report is pending review',
        'in-progress': 'Your report is being processed',
        'completed': 'Your report has been completed! You earned 5 bonus points!'
      };

      await addNotification({
        title: 'Report Status Updated',
        message: statusMessages[status],
        read: false,
        type: 'report',
        relatedId: reportId,
      });

      // Award bonus points for completed reports
      if (status === 'completed' && user) {
        const updatedUser: User = {
          ...user,
          points: user.points + 5,
        };
        await saveUserData(updatedUser);
      }
    } catch (error) {
      console.log('Error updating report status:', error);
      throw error;
    }
  };

  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    try {
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );
      await saveNotificationsData(updatedNotifications);
    } catch (error) {
      console.log('Error marking notification as read:', error);
      throw error;
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
      await saveNotificationsData(updatedNotifications);
    } catch (error) {
      console.log('Error adding notification:', error);
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
      loginUser,
      registerUser,
      logoutUser,
      submitReport,
      updateReportStatus,
      markNotificationAsRead,
      addNotification,
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
