import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { APP_CONFIG } from '@/constants/config';
import type { EmployerOnboardingData } from '@/types';

const TOTAL_STEPS = 2;

export default function EmployerOnboardingScreen() {
  const router = useRouter();
  const { userId, email, phone } = useLocalSearchParams<{
    userId: string;
    email?: string;
    phone?: string;
  }>();
  const { completeEmployerOnboarding, isLoading, error, setError } = useAuth();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [website, setWebsite] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep = (): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!fullName.trim()) errors.fullName = 'Full name is required';
      if (!title.trim()) errors.title = 'Job title is required';
    } else if (step === 2) {
      if (!companyName.trim()) errors.companyName = 'Company name is required';
      if (!industry) errors.industry = 'Please select an industry';
      if (!size) errors.size = 'Please select company size';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    setError(null);
    if (!validateStep()) return;
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setFieldErrors({});
    if (step > 1) {
      setStep((s) => s - 1);
    } else {
      router.back();
    }
  };

  const handleComplete = async () => {
    setError(null);
    if (!validateStep()) return;
    if (!userId) {
      setError('User ID missing');
      return;
    }

    const data: EmployerOnboardingData = {
      full_name: fullName.trim(),
      title: title.trim(),
      company_name: companyName.trim(),
      industry,
      size,
      website: website.trim() || undefined,
    };

    const result = await completeEmployerOnboarding(
      userId,
      email || null,
      phone || null,
      data
    );

    if (result.success) {
      router.replace('/(tabs)/feed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.stepLabel}>
              Step {step} of {TOTAL_STEPS}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${(step / TOTAL_STEPS) * 100}%` }]}
            />
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Step 1: Your Info */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.title}>Your Info</Text>
              <Text style={styles.subtitle}>Tell us about yourself</Text>

              <Input
                label="Full Name"
                placeholder="e.g. Sarah Al Hashimi"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  clearFieldError('fullName');
                }}
                autoCapitalize="words"
                leftIcon="person-outline"
                error={fieldErrors.fullName}
              />

              <Input
                label="Your Job Title"
                placeholder="e.g. HR Manager"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  clearFieldError('title');
                }}
                autoCapitalize="words"
                leftIcon="briefcase-outline"
                error={fieldErrors.title}
              />

              <Button
                title="Next"
                onPress={handleNext}
                size="large"
                fullWidth
                style={styles.actionButton}
              />
            </View>
          )}

          {/* Step 2: Company Details */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.title}>Company Details</Text>
              <Text style={styles.subtitle}>Tell us about your company</Text>

              <Input
                label="Company Name"
                placeholder="e.g. Acme Corp"
                value={companyName}
                onChangeText={(text) => {
                  setCompanyName(text);
                  clearFieldError('companyName');
                }}
                autoCapitalize="words"
                leftIcon="business-outline"
                error={fieldErrors.companyName}
              />

              {/* Industry picker */}
              <Text style={styles.fieldLabel}>Industry</Text>
              <View style={styles.chipGrid}>
                {APP_CONFIG.industries.map((ind) => (
                  <TouchableOpacity
                    key={ind.id}
                    style={[
                      styles.chip,
                      industry === ind.id && styles.chipSelected,
                    ]}
                    onPress={() => {
                      setIndustry(ind.id);
                      clearFieldError('industry');
                    }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        industry === ind.id && styles.chipTextSelected,
                      ]}
                    >
                      {ind.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {fieldErrors.industry && (
                <Text style={styles.fieldError}>{fieldErrors.industry}</Text>
              )}

              {/* Company size picker */}
              <Text style={styles.fieldLabel}>Company Size</Text>
              <View style={styles.chipGrid}>
                {APP_CONFIG.companySizes.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.chip,
                      size === s.id && styles.chipSelected,
                    ]}
                    onPress={() => {
                      setSize(s.id);
                      clearFieldError('size');
                    }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        size === s.id && styles.chipTextSelected,
                      ]}
                    >
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {fieldErrors.size && (
                <Text style={styles.fieldError}>{fieldErrors.size}</Text>
              )}

              <Input
                label="Website (optional)"
                placeholder="e.g. https://acme.com"
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
                keyboardType="url"
                leftIcon="globe-outline"
              />

              <Button
                title="Complete Setup"
                onPress={handleComplete}
                loading={isLoading}
                disabled={isLoading}
                size="large"
                fullWidth
                style={styles.actionButton}
              />
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
  },
  stepLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: 40,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 24,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
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
  stepContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    marginTop: 16,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0FAFA',
  },
  chipText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  fieldError: {
    fontSize: 12,
    color: colors.error,
    marginBottom: 4,
  },
  actionButton: {
    marginTop: 24,
  },
});
