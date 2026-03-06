import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  signUpWithEmail,
  signInWithEmail,
  createUserProfile,
  createCandidateProfile,
  createCompany,
  createEmployerProfile,
  signInWithGoogle,
} from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { CandidateOnboardingData, EmployerOnboardingData } from '@/types';

export function useAuth() {
  const router = useRouter();
  const { loadUserProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email sign up
  const signUpEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await signUpWithEmail(email, password);

      if (signUpError) {
        setError(signUpError.message);
        return { success: false };
      }

      if (data.user) {
        return { success: true, userId: data.user.id };
      }

      return { success: false };
    } catch (err) {
      setError('An unexpected error occurred');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Email sign in
  const signInEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await signInWithEmail(email, password);

      if (signInError) {
        setError(signInError.message);
        return { success: false };
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
        return { success: true };
      }

      return { success: false };
    } catch (err) {
      setError('An unexpected error occurred');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Phone OTP request (TODO: Implement phone OTP)
  const requestPhoneOtp = async (phone: string) => {
    setError('Phone authentication not implemented yet');
    return { success: false };
  };

  // Verify OTP (TODO: Implement phone OTP)
  const verifyPhoneOtp = async (phone: string, otp: string) => {
    setError('Phone authentication not implemented yet');
    return { success: false };
  };

  // Google sign in
  const signInGoogle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await signInWithGoogle();

      if (signInError) {
        setError(signInError.message);
        return { success: false };
      }

      return { success: true };
    } catch (err) {
      setError('Failed to sign in with Google');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Complete candidate onboarding
  const completeCandidateOnboarding = async (
    userId: string,
    email: string | null,
    phone: string | null,
    data: CandidateOnboardingData
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create base user profile
      const { error: userError } = await createUserProfile(
        userId,
        'candidate',
        data.full_name,
        phone,
        email
      );

      if (userError) {
        setError('Failed to create user profile');
        return { success: false };
      }

      // Create candidate profile
      const { error: candidateError } = await createCandidateProfile(userId, {
        headline: data.headline,
        city: data.city,
        country: data.country,
        years_experience: data.years_experience,
        desired_industries: data.desired_industries,
      });

      if (candidateError) {
        setError('Failed to create candidate profile');
        return { success: false };
      }

      // Load the complete profile
      await loadUserProfile(userId);

      return { success: true };
    } catch (err) {
      setError('Onboarding failed');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Complete employer onboarding
  const completeEmployerOnboarding = async (
    userId: string,
    email: string | null,
    phone: string | null,
    data: EmployerOnboardingData
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create base user profile
      const { error: userError } = await createUserProfile(
        userId,
        'employer',
        data.full_name,
        phone,
        email
      );

      if (userError) {
        setError('Failed to create user profile');
        return { success: false };
      }

      // Create company
      const { data: companyData, error: companyError } = await createCompany({
        name: data.company_name,
        industry: data.industry,
        size: data.size,
        website: data.website,
      });

      if (companyError || !companyData) {
        setError('Failed to create company');
        return { success: false };
      }

      // Create employer profile
      const { error: employerError } = await createEmployerProfile(userId, companyData.id, {
        title: data.title,
      });

      if (employerError) {
        setError('Failed to create employer profile');
        return { success: false };
      }

      // Load the complete profile
      await loadUserProfile(userId);

      return { success: true };
    } catch (err) {
      setError('Onboarding failed');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    setError,
    signUpEmail,
    signInEmail,
    requestPhoneOtp,
    verifyPhoneOtp,
    signInGoogle,
    completeCandidateOnboarding,
    completeEmployerOnboarding,
  };
}
