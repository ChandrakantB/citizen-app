import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { apiService } from '../services/apiService';
import { Ionicons } from '@expo/vector-icons';

export default function BackendTest() {
  const [testResults, setTestResults] = useState<string>('Ready to test your backend...\n');
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('chand@gmail.com');
  const [loginPassword, setLoginPassword] = useState('strongpassword123');
  const [signupFirstName, setSignupFirstName] = useState('Test');
  const [signupLastName, setSignupLastName] = useState('User');
  const [signupEmail, setSignupEmail] = useState('test@example.com');
  const [signupPassword, setSignupPassword] = useState('testpassword123');

  const clearResults = () => {
    setTestResults('Ready to test your backend...\n');
  };

  const addResult = (message: string) => {
    setTestResults(prev => prev + message + '\n');
  };

  const testConnection = async () => {
    addResult('🌐 Testing backend connection...');
    try {
      const response = await fetch('https://origin-jxav.onrender.com');
      const data = await response.text();
      addResult(`✅ Backend is alive: ${response.status} ${response.statusText}`);
      addResult(`📄 Response preview: ${data.substring(0, 100)}...`);
    } catch (error) {
      addResult(`❌ Connection failed: ${error.message}`);
    }
  };

  const testLogin = async () => {
    addResult(`🔐 Testing login with: ${loginEmail}`);
    setIsLoading(true);
    
    try {
      const response = await apiService.login(loginEmail, loginPassword);
      addResult('✅ Login Success!');
      addResult(`🔑 Token: ${response.token?.substring(0, 30)}...`);
      addResult(`👤 User: ${JSON.stringify(response.user, null, 2)}`);
      
      // Set token for future requests
      if (response.token) {
        apiService.setAuthToken(response.token);
      }
    } catch (error) {
      addResult(`❌ Login Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSignup = async () => {
    addResult(`📝 Testing signup with: ${signupEmail}`);
    setIsLoading(true);
    
    try {
      const response = await apiService.register({
        firstName: signupFirstName,
        lastName: signupLastName,
        email: signupEmail,
        password: signupPassword,
        address: {
          addressLine: 'Test Address Line',
          latitude: 20.9898,
          longitude: 76.9898
        },
        profileImage: 'https://example.com/profile.jpg'
      });
      
      addResult('✅ Signup Success!');
      addResult(`🔑 Token: ${response.token?.substring(0, 30)}...`);
      addResult(`👤 User: ${JSON.stringify(response.user, null, 2)}`);
    } catch (error) {
      addResult(`❌ Signup Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testProfile = async () => {
    addResult('👤 Testing get profile...');
    setIsLoading(true);
    
    try {
      const response = await apiService.getUserProfile();
      addResult('✅ Profile Success!');
      addResult(`📋 Profile: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      addResult(`❌ Profile Error: ${error.message}`);
      addResult('💡 Note: You need to login first to get profile');
    } finally {
      setIsLoading(false);
    }
  };

  const testReport = async () => {
    addResult('📋 Testing submit report...');
    setIsLoading(true);
    
    try {
      const response = await apiService.submitReport({
        type: 'General Waste',
        location: 'Test Location',
        description: 'Test waste report from mobile app',
        photoUri: 'https://example.com/photo.jpg'
      });
      
      addResult('✅ Report Submit Success!');
      addResult(`📄 Response: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      addResult(`❌ Report Error: ${error.message}`);
      addResult('💡 Note: This endpoint might not exist yet');
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    clearResults();
    addResult('🚀 Running all backend tests...\n');
    
    await testConnection();
    addResult('');
    await testLogin();
    addResult('');
    await testProfile();
    addResult('');
    await testReport();
    addResult('');
    addResult('🏁 All tests completed!');
    
    setIsLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flask" size={24} color="#007AFF" />
        <Text style={styles.title}>Backend API Test</Text>
      </View>
      
      <Text style={styles.url}>https://origin-jxav.onrender.com</Text>
      
      {/* Login Test Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Login Test</Text>
        <TextInput
          style={styles.input}
          value={loginEmail}
          onChangeText={setLoginEmail}
          placeholder="Login Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={loginPassword}
          onChangeText={setLoginPassword}
          placeholder="Login Password"
          secureTextEntry
        />
        <TouchableOpacity 
          style={[styles.button, styles.loginButton]} 
          onPress={testLogin}
          disabled={isLoading}
        >
          <Ionicons name="log-in" size={16} color="white" />
          <Text style={styles.buttonText}>Test Login</Text>
        </TouchableOpacity>
      </View>

      {/* Signup Test Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Signup Test</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            value={signupFirstName}
            onChangeText={setSignupFirstName}
            placeholder="First Name"
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            value={signupLastName}
            onChangeText={setSignupLastName}
            placeholder="Last Name"
          />
        </View>
        <TextInput
          style={styles.input}
          value={signupEmail}
          onChangeText={setSignupEmail}
          placeholder="Signup Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={signupPassword}
          onChangeText={setSignupPassword}
          placeholder="Signup Password"
          secureTextEntry
        />
        <TouchableOpacity 
          style={[styles.button, styles.signupButton]} 
          onPress={testSignup}
          disabled={isLoading}
        >
          <Ionicons name="person-add" size={16} color="white" />
          <Text style={styles.buttonText}>Test Signup</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Tests</Text>
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.button, styles.quickButton]} 
            onPress={testConnection}
            disabled={isLoading}
          >
            <Ionicons name="globe" size={16} color="white" />
            <Text style={styles.quickButtonText}>Connection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.quickButton]} 
            onPress={testProfile}
            disabled={isLoading}
          >
            <Ionicons name="person" size={16} color="white" />
            <Text style={styles.quickButtonText}>Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.quickButton]} 
            onPress={testReport}
            disabled={isLoading}
          >
            <Ionicons name="document" size={16} color="white" />
            <Text style={styles.quickButtonText}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Run All Tests */}
      <TouchableOpacity 
        style={[styles.button, styles.runAllButton]} 
        onPress={runAllTests}
        disabled={isLoading}
      >
        <Ionicons name="play" size={18} color="white" />
        <Text style={styles.buttonText}>
          {isLoading ? 'Running Tests...' : 'Run All Tests'}
        </Text>
      </TouchableOpacity>

      {/* Clear Results */}
      <TouchableOpacity 
        style={[styles.button, styles.clearButton]} 
        onPress={clearResults}
      >
        <Ionicons name="trash" size={16} color="#666" />
        <Text style={[styles.buttonText, { color: '#666' }]}>Clear Results</Text>
      </TouchableOpacity>
      
      {/* Results Display */}
      <View style={styles.resultsContainer}>
        <View style={styles.resultsHeader}>
          <Ionicons name="terminal" size={16} color="#00ff00" />
          <Text style={styles.resultsTitle}>Test Results</Text>
        </View>
        <ScrollView style={styles.resultsScroll} nestedScrollEnabled>
          <Text style={styles.results}>{testResults}</Text>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  url: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    fontFamily: 'monospace',
    backgroundColor: '#e8e8e8',
    padding: 8,
    borderRadius: 4,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontSize: 14,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  loginButton: {
    backgroundColor: '#007AFF',
  },
  signupButton: {
    backgroundColor: '#28a745',
  },
  quickButton: {
    backgroundColor: '#6c757d',
    flex: 1,
    paddingVertical: 10,
  },
  runAllButton: {
    backgroundColor: '#ff6b35',
    paddingVertical: 16,
    marginBottom: 16,
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  quickButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  resultsContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2d2d2d',
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
    gap: 8,
  },
  resultsTitle: {
    color: '#00ff00',
    fontWeight: '600',
    fontSize: 14,
  },
  resultsScroll: {
    maxHeight: 300,
  },
  results: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#00ff00',
    padding: 12,
    lineHeight: 16,
  },
});
