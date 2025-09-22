import { Platform } from 'react-native';
import { Storage } from '../utils/storage';

const isWeb = Platform.OS === 'web';
const BASE_URL = 'https://origin-jxav.onrender.com/api';

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

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  user?: any;
  token?: string;
  error?: string;
}

class ApiService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = BASE_URL;
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const token = await Storage.getItem('authToken');
      if (token) {
        this.authToken = token;
      }
    } catch (error) {
      console.log('Failed to load auth token:', error);
    }
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
      },
      ...(isWeb && { mode: 'cors' }),
    };

    // Don't set Content-Type for FormData
    if (!(options.body instanceof FormData)) {
      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json',
      };
    }

    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    
    if (options.body instanceof FormData) {
      console.log('📤 FormData keys:', Array.from(options.body.keys()));
    } else if (options.body) {
      console.log('📤 Request body:', typeof options.body === 'string' ? JSON.parse(options.body) : options.body);
    }

    try {
      const response = await fetch(url, config);
      
      let data;
      try {
        const textResponse = await response.text();
        console.log('📥 Raw response:', textResponse);
        
        if (!textResponse.startsWith('{') && !textResponse.startsWith('[')) {
          throw new Error(`Server returned non-JSON response: ${textResponse}`);
        }
        
        data = JSON.parse(textResponse);
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
      throw error;
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest('/auth/profile');
  }

  // ✅ UPDATED: AI Analysis using /api/cleanup endpoint
  async analyzeWaste(data: {
    locationText: string;
    lat: number;
    lng: number;
    imageFile?: any;
  }): Promise<WasteAnalysisResponse> {
    console.log('🔍 Starting waste analysis with /api/cleanup...');
    console.log('🔍 Received data:', data);
    
    // CRITICAL: Validate input data first
    if (!data) {
      console.error('❌ analyzeWaste called with undefined data');
      throw new Error('Analysis data is required');
    }

    if (!data.locationText) {
      console.error('❌ locationText is missing from data:', data);
      throw new Error('Location text is required for analysis');
    }

    if (typeof data.lat !== 'number' || typeof data.lng !== 'number') {
      console.error('❌ Invalid coordinates:', { lat: data.lat, lng: data.lng });
      throw new Error('Valid latitude and longitude are required');
    }

    console.log('✅ Data validation passed:', {
      locationText: data.locationText,
      lat: data.lat,
      lng: data.lng,
      hasImage: !!data.imageFile
    });
    
    try {
      const formData = new FormData();
      
      // Add validated data to FormData
      formData.append('locationText', data.locationText);
      formData.append('lat', data.lat.toString());
      formData.append('lng', data.lng.toString());
      
      console.log('📤 FormData prepared with:', {
        locationText: data.locationText,
        lat: data.lat,
        lng: data.lng
      });
      
      // Handle image file properly for mobile vs web
      if (data.imageFile) {
        if (isWeb) {
          // Web handling - convert URL to blob
          try {
            console.log('🌐 Processing web image:', data.imageFile);
            const response = await fetch(data.imageFile);
            const blob = await response.blob();
            formData.append('image', blob, 'waste-image.jpg');
            console.log('✅ Web image added to FormData');
          } catch (webError) {
            console.log('⚠️ Web image processing failed:', webError);
            // Continue without image for web demo
          }
        } else {
          // Mobile handling - Use the correct format for React Native
          const imageUri = data.imageFile;
          const filename = imageUri.split('/').pop() || 'waste-image.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const fileType = match ? `image/${match[1]}` : 'image/jpeg';
          
          // Create proper file object for React Native FormData
          const fileObj = {
            uri: imageUri,
            type: fileType,
            name: filename,
          } as any;
          
          formData.append('image', fileObj);
          console.log('📷 Mobile image added to FormData:', { 
            uri: imageUri, 
            type: fileType, 
            name: filename 
          });
        }
      } else {
        console.log('⚠️ No image file provided for analysis');
      }

      // ENHANCED: Make FormData request with extended timeout to /api/cleanup
      const url = `${this.baseURL}/cleanup`;
      
      const config: RequestInit = {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type - FormData needs boundary
          ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
        },
        ...(isWeb && { mode: 'cors' }),
      };

      console.log(`🌐 Making AI analysis request to: ${url}`);
      console.log('📤 FormData keys being sent:', Array.from(formData.keys()));
      
      // Create timeout promise (20 seconds for AI analysis)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('AI analysis timeout after 20 seconds. This is normal for complex analysis.'));
        }, 20000); // 20 seconds timeout
      });
      
      // Race between fetch and timeout
      const response = await Promise.race([
        fetch(url, config),
        timeoutPromise
      ]) as Response;
      
      let responseData;
      try {
        const textResponse = await response.text();
        console.log('📥 Raw AI analysis response:', textResponse);
        
        if (!textResponse.startsWith('{') && !textResponse.startsWith('[')) {
          throw new Error(`Server returned non-JSON response: ${textResponse}`);
        }
        
        responseData = JSON.parse(textResponse);
      } catch (parseError) {
        console.error('❌ Failed to parse AI analysis JSON response:', parseError);
        throw new Error(`Invalid AI analysis response format: ${parseError.message}`);
      }

      console.log(`📊 AI Analysis Response status: ${response.status}`);
      console.log(`📋 AI Analysis Response data:`, responseData);

      if (!response.ok) {
        console.error(`❌ AI Analysis API Error ${response.status}:`, responseData);
        throw new Error(responseData.message || responseData.error || `AI Analysis HTTP Error: ${response.status}`);
      }

      // ✅ UPDATED: Extract analysis from /api/cleanup response format
      const analysis: WasteAnalysisResponse = {
        wasteType: responseData.analysis?.wasteType || responseData.wasteType || 'Unknown',
        urgency: responseData.analysis?.urgency || responseData.urgency || 'Medium',
        severity: responseData.analysis?.severity || responseData.severity || 'Minor',
        reasoning: responseData.analysis?.reasoning || responseData.reasoning || 'AI analysis completed successfully',
        segregationLevel: responseData.analysis?.segregationLevel || responseData.segregationLevel || 'None',
        segregationReasoning: responseData.analysis?.segregationReasoning || responseData.segregationReasoning || 'No segregation analysis available',
        id: responseData._id || responseData.id || Date.now().toString(),
        createdAt: responseData.createdAt || new Date().toISOString(),
      };

      console.log('✅ AI Analysis completed successfully via /api/cleanup:', {
        wasteType: analysis.wasteType,
        urgency: analysis.urgency,
        severity: analysis.severity
      });
      
      return analysis;

    } catch (error) {
      console.error('💥 AI Analysis failed via /api/cleanup:', error);
      
      // Provide specific error messages based on error type
      if (error.message.includes('timeout')) {
        console.log('⏱️ AI analysis timed out - this is normal for complex images');
      } else if (error.message.includes('Network request failed')) {
        console.log('🌐 Network issue - check CORS configuration or internet connection');
      } else if (error.message.includes('Failed to fetch')) {
        console.log('📡 Backend connection failed - server might be unavailable');
      }
      
      throw error;
    }
  }

  // ✅ UPDATED: Submit Report using /api/cleanup endpoint
  async submitReport(reportData: {
    type: string;
    location: string;
    description: string;
    photoUri: string;
    analysis?: WasteAnalysisResponse;
    coordinates?: { latitude: number; longitude: number };
  }): Promise<ApiResponse<any>> {
    console.log('📋 Submitting report to backend via /api/cleanup:', reportData);

    try {
      const formData = new FormData();
      
      // Add the image file (required by /api/cleanup)
      if (reportData.photoUri) {
        if (isWeb) {
          const response = await fetch(reportData.photoUri);
          const blob = await response.blob();
          formData.append('image', blob, 'cleanup-report.jpg');
        } else {
          const fileObj = {
            uri: reportData.photoUri,
            type: 'image/jpeg',
            name: 'cleanup-report.jpg',
          } as any;
          formData.append('image', fileObj);
        }
      }

      // ✅ ADD REQUIRED FIELDS for /api/cleanup endpoint
      formData.append('locationText', reportData.location);
      
      // Add coordinates if available (from mobile location)
      if (reportData.coordinates) {
        formData.append('lat', reportData.coordinates.latitude.toString());
        formData.append('lng', reportData.coordinates.longitude.toString());
      } else {
        // Default coordinates if not available
        formData.append('lat', '23.1915');
        formData.append('lng', '79.9919');
      }

      console.log('🌐 API Request: POST /api/cleanup');
      console.log('📤 Request body keys:', Array.from(formData.keys()));

      const response = await this.makeRequest('/cleanup', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Cleanup response:', response);
      return response;

    } catch (error) {
      console.error('❌ Submit cleanup report failed:', error);
      throw error;
    }
  }


  async classifyWasteWithAI(data: {
  prompt?: string;
  imageFile?: any;
}): Promise<any> {
  console.log('🤖 GreenMitra: Classifying waste with AI...');
  
  try {
    const formData = new FormData();
    
    // Add text prompt if provided
    if (data.prompt) {
      formData.append('prompt', data.prompt);
    }
    
    // Add image if provided
    if (data.imageFile) {
      if (isWeb) {
        const response = await fetch(data.imageFile);
        const blob = await response.blob();
        formData.append('image', blob, 'greenmitra-image.jpg');
      } else {
        const fileObj = {
          uri: data.imageFile,
          type: 'image/jpeg',
          name: 'greenmitra-image.jpg',
        } as any;
        formData.append('image', fileObj);
      }
    }
    
    console.log('📤 Sending to /api/waste/classify:', {
      hasPrompt: !!data.prompt,
      hasImage: !!data.imageFile
    });
    
    const response = await this.makeRequest('/waste/classify', {
      method: 'POST',
      body: formData,
    });
    
    console.log('📥 GreenMitra response:', response);
    return response;
    
  } catch (error) {
    console.error('❌ GreenMitra classification failed:', error);
    throw error;
  }
}

async getWasteHistory(page: number = 1, limit: number = 20): Promise<any> {
  console.log('📚 Fetching waste classification history...');
  
  try {
    const response = await this.makeRequest(`/waste/history?page=${page}&limit=${limit}`);
    console.log('📋 History response:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch history:', error);
    throw error;
  }
}

  // Other API methods remain the same...
  async getUserReports(): Promise<ApiResponse<any>> {
    return this.makeRequest('/cleanup/history');
  }

  async getUserNotifications(): Promise<ApiResponse<any>> {
    return this.makeRequest('/notifications');
  }

  async updateReportStatus(reportId: string, status: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async updateUserProfile(userData: Partial<any>): Promise<ApiResponse<any>> {
    return this.makeRequest('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }
}

export const apiService = new ApiService();
