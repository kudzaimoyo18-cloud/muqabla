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
import type { CandidateOnboardingData } from '@/types';

const TOTAL_STEPS = 3;

export default function CandidateOnboardingScreen() {
  const router = useRouter();
  const { userId, email, phone } = useLocalSearchParams<{
    userId: string;
    email?: string;
    phone?: string;
  }>();
  const { completeCandidateOnboarding, isLoading, error, setError } = useAuth();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const cities = country
    ? APP_CONFIG.gcc.cities[country as keyof typeof APP_CONFIG.gcc.cities] || []
    : [];

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
    } else if (step === 2) {
      if (!country) errors.country = 'Please select a country';
      if (!city) errors.city = 'Please select a city';
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

  const toggleIndustry = (id: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setError(null);
    if (!validateStep()) return;
    if (!userId) {
      setError('User ID missing');
      return;
    }

    const data: CandidateOnboardingData = {
      full_name: fullName.trim(),
      headline: headline.trim() || undefined,
      country,
      city,
      years_experience: yearsExperience
        ? parseInt(yearsExperience, 10)
        : undefined,
      desired_industries: selectedIndustries,
    };

    const result = await completeCandidateOnboarding(
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

          {/* Step 1: About You */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.title}>About You</Text>
              <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

              <Input
                label="Full Name"
                placeholder="e.g. Ahmed Al Maktoum"
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
                label="Headline (optional)"
                placeholder="e.g. Senior React Developer"
                value={headline}
                onChangeText={setHeadline}
                autoCapitalize="words"
                leftIcon="briefcase-outline"
                hint="A short professional title"
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

          {/* Step 2: Location & Experience */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.title}>Location & Experience</Text>
              <Text style={styles.subtitle}>Where are you based?</Text>

              <Text style={styles.fieldLabel}>Country</Text>
              <View style={styles.chipGrid}>
                {APP_CONFIG.gcc.countries.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    style={[
                      styles.chip,
                      country === c.code && styles.chipSelected,
                    ]}
                    onPress={() => {
                      setCountry(c.code);
                      setCity('');
                      clearFieldError('country');
                    }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        country === c.code && styles.chipTextSelected,
                      ]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {fieldErrors.country && (
                <Text style={styles.fieldError}>{fieldErrors.country}</Text>
              )}

              {cities.length > 0 && (
                <>
                  <Text style={styles.fieldLabel}>City</Text>
                  <View style={styles.chipGrid}>
                    {cities.map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.chip,
                          city === c && styles.chipSelected,
                        ]}
                        onPress={() => {
                          setCity(c);
                          clearFieldError('city');
                        }}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            city === c && styles.chipTextSelected,
                          ]}
                        >
                          {c}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {fieldErrors.city && (
                    <Text style={styles.fieldError}>{fieldErrors.city}</Text>
                  )}
                </>
              )}

              <Text style={styles.fieldLabel}>Experience Level</Text>
              <View style={styles.chipGrid}>
                {APP_CONFIG.experienceLevels.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.chip,
                      yearsExperience === level.id && styles.chipSelected,
                    ]}
                    onPress={() => setYearsExperience(level.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        yearsExperience === level.id && styles.chipTextSelected,
                      ]}
                    >
                      {level.name} ({level.years}y)
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                title="Next"
                onPress={handleNext}
                size="large"
                fullWidth
                style={styles.actionButton}
              />
            </View>
          )}

          {/* Step 3: Industries */}
          {step === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.title}>What interests you?</Text>
              <Text style={styles.subtitle}>
                Select industries you'd like to work in
              </Text>

              <View style={styles.chipGrid}>
                {APP_CONFIG.industries.map((ind) => (
                  <TouchableOpacity
                    key={ind.id}
                    style={[
                      styles.chip,
                      selectedIndustries.includes(ind.id) && styles.chipSelected,
                    ]}
                    onPress={() => toggleIndustry(ind.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedIndustries.includes(ind.id) &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {ind.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                title="Complete Profile"
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
