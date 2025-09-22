import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';

export default function SignupScreen() {
  const { theme, isDark } = useTheme();
  const { registerUser } = useData();
  const styles = createStyles(theme);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const { name, email, phone, password, confirmPassword } = formData;
    
    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔍 Signup form calling registerUser with:', {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: password ? '[PRESENT]' : '[MISSING]', // Debug log
        passwordLength: password.length
      });

      // FIXED: Now passing the password correctly
      const success = await registerUser({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: password, // ✅ Added the missing password!
      });

      if (success) {
        Alert.alert(
          'Success', 
          'Account created successfully! Welcome to Bin2Win!', 
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/') }]
        );
      } else {
        Alert.alert('Error', 'An account with this email already exists. Please try logging in.');
      }
    } catch (error) {
      console.log('❌ Signup error:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Bin2Win community</Text>
        </View>

        {/* Form */}
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={theme.textSecondary}
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor={theme.textSecondary}
                value={formData.phone}
                onChangeText={(value) => updateField('phone', value)}
                keyboardType="phone-pad"
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
                placeholder="Create a password (min 6 characters)"
                placeholderTextColor={theme.textSecondary}
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                secureTextEntry={!showPassword}
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirm your password"
                placeholderTextColor={theme.textSecondary}
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                disabled={loading}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Strength Indicator */}
          {formData.password.length > 0 && (
            <View style={styles.passwordStrength}>
              <View style={[
                styles.strengthBar, 
                { 
                  backgroundColor: formData.password.length < 6 
                    ? '#dc2626' 
                    : formData.password.length < 8 
                      ? '#f59e0b' 
                      : '#10b981',
                  width: `${Math.min(100, (formData.password.length / 8) * 100)}%`
                }
              ]} />
              <Text style={[styles.strengthText, {
                color: formData.password.length < 6 
                  ? '#dc2626' 
                  : formData.password.length < 8 
                    ? '#f59e0b' 
                    : '#10b981'
              }]}>
                {formData.password.length < 6 
                  ? 'Weak' 
                  : formData.password.length < 8 
                    ? 'Good' 
                    : 'Strong'
                }
              </Text>
            </View>
          )}

          {/* Password Match Indicator */}
          {formData.confirmPassword.length > 0 && (
            <View style={styles.matchIndicator}>
              <Ionicons 
                name={formData.password === formData.confirmPassword ? "checkmark-circle" : "close-circle"} 
                size={16} 
                color={formData.password === formData.confirmPassword ? "#10b981" : "#dc2626"} 
              />
              <Text style={[styles.matchText, {
                color: formData.password === formData.confirmPassword ? "#10b981" : "#dc2626"
              }]}>
                {formData.password === formData.confirmPassword ? "Passwords match" : "Passwords don't match"}
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={[
              styles.signupButton, 
              loading && styles.signupButtonDisabled,
              // Disable if passwords don't match
              (formData.password !== formData.confirmPassword && formData.confirmPassword.length > 0) && styles.signupButtonDisabled
            ]}
            onPress={handleSignup}
            disabled={loading || (formData.password !== formData.confirmPassword && formData.confirmPassword.length > 0)}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="reload" size={20} color="#ffffff" style={styles.loadingIcon} />
                <Text style={styles.signupButtonText}>Creating Account...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="person-add" size={20} color="#ffffff" style={styles.buttonIcon} />
                <Text style={styles.signupButtonText}>Create Account</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.loginSection}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/login')}
              disabled={loading}
            >
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Terms and Privacy */}
          <View style={styles.termsSection}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
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
    padding: 5,
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
    minHeight: 52,
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

  // Password Strength Styles
  passwordStrength: {
    marginTop: -15,
    marginBottom: 15,
    height: 20,
    justifyContent: 'center',
  },
  strengthBar: {
    height: 3,
    borderRadius: 2,
    marginBottom: 5,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Password Match Styles
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -15,
    marginBottom: 15,
    gap: 6,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '500',
  },

  signupButton: {
    backgroundColor: theme.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 56,
    justifyContent: 'center',
  },
  signupButtonDisabled: {
    backgroundColor: theme.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingIcon: {
    // Add rotation animation if desired
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonIcon: {
    // Icon styling
  },
  signupButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    color: theme.textSecondary,
    fontSize: 16,
  },
  loginLink: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  termsSection: {
    paddingBottom: 40,
    paddingHorizontal: 10,
  },
  termsText: {
    color: theme.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: theme.primary,
    fontWeight: '500',
  },
});
