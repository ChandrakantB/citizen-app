import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const { loginUser } = useData();
  const styles = createStyles(theme);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  console.log('Login button pressed!'); // Debug log
  
  if (!email || !password) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }

  setLoading(true);
  console.log('Attempting login with:', email); // Debug log
  
  try {
    const success = await loginUser(email.toLowerCase().trim(), password);
    console.log('Login result:', success); // Debug log
    
    if (success) {
      console.log('Login successful, navigating...'); // Debug log
      // Direct navigation without alert
      router.replace('/(tabs)/');
    } else {
      Alert.alert('Error', 'Invalid credentials. Try:\ndemo@bin2win.com / password');
    }
  } catch (error) {
    console.log('Login error:', error); // Debug log
    Alert.alert('Error', 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Enter your password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={loading}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword} disabled={loading}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Demo Credentials */}
          <View style={styles.demoCard}>
            <Text style={styles.demoTitle}>Demo Account:</Text>
            <Text style={styles.demoText}>Email: demo@bin2win.com</Text>
            <Text style={styles.demoText}>Password: password</Text>
            <Text style={styles.demoNote}>Or create your own account!</Text>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loginButtonText}>Signing In...</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupSection}>
            <Text style={styles.signupText}>Don&apos;t have an account? </Text>
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/signup')}
              disabled={loading}
            >
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 30,
    paddingBottom: 40,
    backgroundColor: theme.background,
  },
  backButton: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  form: {
    flex: 1,
    backgroundColor: theme.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  inputIcon: {
    marginLeft: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 15,
    fontSize: 16,
    color: theme.text,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  demoCard: {
    backgroundColor: theme.warning + '20',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: theme.warning + '40',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.warning,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: theme.text,
    marginBottom: 2,
  },
  demoNote: {
    fontSize: 11,
    color: theme.textSecondary,
    marginTop: 5,
    fontStyle: 'italic',
  },
  loginButton: {
    backgroundColor: theme.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: theme.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: theme.textSecondary,
    fontSize: 16,
  },
  signupLink: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
