import * as Location from 'expo-location';

const API_BASE_URL = 'https://origin-jxav.onrender.com/api';
const isWeb = typeof window !== 'undefined';

export interface ApiResponse<T> {
  token?: string;
  user?: T;
  message?: string;
  success?: boolean;
  error?: string;
  data?: any;
}

export interface WasteAnalysisResponse {
  wasteType: string;
  urgency: string;
  severity: string;
  reasoning: string;
  segregationLevel: string;
  segregationReasoning: string;
  id: string;
  createdAt: string;
}

class ApiService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) {
    this.authToken = token;
    console.log('🔑 Auth token set:', token.substring(0, 20) + '...');
  }

  clearAuthToken() {
    this.authToken = null;
    console.log('🔑 Auth token cleared');
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
          ...(isWeb && {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }),
          ...options.headers,
        },
        ...(isWeb && { mode: 'cors' }),
      };

      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      console.log('📤 Request body:', config.body);
      
      const response = await fetch(url, config);
      
      let data;
      try {
        const textResponse = await response.text();
        console.log('📥 Raw response:', textResponse);
        
        if (!textResponse.startsWith('{') && !textResponse.startsWith('[')) {
          throw new Error(`Server returned non-JSON response: ${textResponse}`);
        }
        
        data = textResponse ? JSON.parse(textResponse) : {};
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        throw new Error(`Invalid response format from server: ${parseError.message}`);
      }

      console.log(`📊 Response status: ${response.status}`);
      console.log(`📋 Response data:`, data);

      if (!response.ok) {
        console.error(`❌ API Error ${response.status}:`, data);
        throw new Error(data.message || data.error || `HTTP Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('💥 API Request failed:', error);
      
      if (isWeb && error.message.includes('Failed to fetch')) {
        throw new Error('Backend connection failed. This is normal in web browser due to CORS. Try running on mobile device or enable CORS on backend.');
      }
      
      throw error;
    }
  }

  private async makeFormDataRequest(
    endpoint: string,
    formData: FormData
  ): Promise<any> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const config: RequestInit = {
        method: 'POST',
        body: formData,
        headers: {
          ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
        },
        ...(isWeb && { mode: 'cors' }),
      };

      console.log(`🌐 FormData Request: POST ${url}`);
      
      const response = await fetch(url, config);
      
      let data;
      try {
        const textResponse = await response.text();
        console.log('📥 Raw response:', textResponse);
        data = textResponse ? JSON.parse(textResponse) : {};
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        throw new Error(`Invalid response format from server: ${parseError.message}`);
      }

      console.log(`📊 Response status: ${response.status}`);
      console.log(`📋 Response data:`, data);

      if (!response.ok) {
        console.error(`❌ API Error ${response.status}:`, data);
        throw new Error(data.message || data.error || `HTTP Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('💥 FormData Request failed:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    address: {
      addressLine: string;
      latitude: number;
      longitude: number;
    };
    profileImage?: string;
  }): Promise<ApiResponse<any>> {
    console.log('📝 ApiService register called with:', userData);
    return this.makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // NEW: Waste Analysis API
  async analyzeWaste(data: {
    locationText: string;
    lat: number;
    lng: number;
    imageFile?: any; // Will be handled as FormData
  }): Promise<WasteAnalysisResponse> {
    console.log('🔍 Starting waste analysis with data:', data);
    
    const formData = new FormData();
    formData.append('locationText', data.locationText);
    formData.append('lat', data.lat.toString());
    formData.append('lng', data.lng.toString());
    
    // Handle image file - this will be different for web vs mobile
    if (data.imageFile) {
      if (isWeb) {
        // For web, create a dummy image blob
        const response = await fetch(data.imageFile);
        const blob = await response.blob();
        formData.append('image', blob, 'waste-image.jpg');
      } else {
        // For mobile, handle file upload
        const fileInfo = {
          uri: data.imageFile,
          type: 'image/jpeg',
          name: 'waste-image.jpg',
        };
        formData.append('image', fileInfo as any);
      }
    }

    return this.makeFormDataRequest('/cleanup', formData);
  }

  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest('/user/profile');
  }

  async updateUserProfile(userData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/user/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async submitReport(reportData: {
    type: string;
    location: string;
    description: string;
    photoUri: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    analysis?: WasteAnalysisResponse;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getUserReports(): Promise<ApiResponse<any>> {
    return this.makeRequest('/reports/user');
  }

  async getAllReports(): Promise<ApiResponse<any>> {
    return this.makeRequest('/reports');
  }

  async updateReportStatus(reportId: string, status: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/reports/${reportId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteReport(reportId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/reports/${reportId}`, {
      method: 'DELETE',
    });
  }

  async getUserNotifications(): Promise<ApiResponse<any>> {
    return this.makeRequest('/notifications');
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<any>> {
    return this.makeRequest('/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  async testConnection(): Promise<any> {
    try {
      console.log('🧪 Testing connection to backend...');
      const response = await fetch(`${this.baseURL.replace('/api', '')}/`, {
        method: 'GET',
        ...(isWeb && { mode: 'cors' }),
      });
      
      const data = await response.text();
      console.log('✅ Connection test successful:', response.status);
      return { status: response.status, data };
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      if (isWeb) {
        throw new Error('CORS error - Backend connection blocked by browser. Run on mobile device for full functionality.');
      }
      throw error;
    }
  }
}

export const apiService = new ApiService(API_BASE_URL);
