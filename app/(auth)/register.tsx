import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { colors } from '@/constants/colors';

type UserRole = 'candidate' | 'employer';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUpEmail, isLoading, error, setError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedRole) {
      errors.role = 'Please select how you want to use Muqabla';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignUp = async () => {
    setError(null);
    if (!validate()) return;

    const result = await signUpEmail(email.trim(), password);

    if (result.success && result.userId) {
      // Navigate to the appropriate onboarding screen
      if (selectedRole === 'candidate') {
        router.replace({
          pathname: '/(auth)/onboarding/candidate',
          params: { userId: result.userId, email: email.trim() },
        });
      } else {
        router.replace({
          pathname: '/(auth)/onboarding/employer',
          params: { userId: result.userId, email: email.trim() },
        });
      }
    }
  };

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Muqabla and start your video-first job journey</Text>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Role Selection */}
          <Text style={styles.sectionLabel}>I want to...</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleCard, selectedRole === 'candidate' && styles.roleCardSelected]}
              onPress={() => { setSelectedRole('candidate'); clearFieldError('role'); }}
            >
              <Ionicons
                name="person-outline"
                size={28}
                color={selectedRole === 'candidate' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.roleTitle, selectedRole === 'candidate' && styles.roleTitleSelected]}>
                Find a Job
              </Text>
              <Text style={styles.roleDesc}>Record video applications</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, selectedRole === 'employer' && styles.roleCardSelected]}
              onPress={() => { setSelectedRole('employer'); clearFieldError('role'); }}
            >
              <Ionicons
                name="business-outline"
                size={28}
                color={selectedRole === 'employer' ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.roleTitle, selectedRole === 'employer' && styles.roleTitleSelected]}>
                Hire Talent
              </Text>
              <Text style={styles.roleDesc}>Post jobs & review videos</Text>
            </TouchableOpacity>
          </View>
          {fieldErrors.role && <Text style={styles.fieldError}>{fieldErrors.role}</Text>}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={(text) => { setEmail(text); clearFieldError('email'); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon="mail-outline"
              error={fieldErrors.email}
            />

            <Input
              label="Password"
              placeholder="Create password (min 6 characters)"
              value={password}
              onChangeText={(text) => { setPassword(text); clearFieldError('password'); }}
              secureTextEntry
              autoCapitalize="none"
              leftIcon="lock-closed-outline"
              error={fieldErrors.password}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={(text) => { setConfirmPassword(text); clearFieldError('confirmPassword'); }}
              secureTextEntry
              autoCapitalize="none"
              leftIcon="lock-closed-outline"
              error={fieldErrors.confirmPassword}
            />

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={isLoading}
              disabled={isLoading}
              size="large"
              fullWidth
              style={styles.signUpButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login">
              <Text style={styles.link}>Sign In</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  back: {
    marginBottom: 16,
    width: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  roleCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 8,
  },
  roleCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0FAFA',
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  roleTitleSelected: {
    color: colors.primary,
  },
  roleDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fieldError: {
    fontSize: 12,
    color: colors.error,
    marginBottom: 8,
  },
  form: {
    marginTop: 16,
    marginBottom: 24,
  },
  signUpButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
