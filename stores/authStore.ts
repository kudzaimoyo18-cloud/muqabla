import { create } from 'zustand';
import { supabase, getUserProfile, getCandidateProfile, getEmployerProfile } from '@/lib/supabase';
import type { User, CandidateProfile, Employer, Company } from '@/types';

interface AuthState {
  // State
  user: User | null;
  candidateProfile: CandidateProfile | null;
  employerProfile: (Employer & { company: Company }) | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
  setCandidateProfile: (profile: CandidateProfile | null) => void;
  setEmployerProfile: (profile: (Employer & { company: Company }) | null) => void;
  loadUserProfile: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  candidateProfile: null,
  employerProfile: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    try {
      set({ isLoading: true });

      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Load user profile
        await get().loadUserProfile(session.user.id);
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await get().loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          get().reset();
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  setUser: (user) => set({ user }),

  setCandidateProfile: (candidateProfile) => set({ candidateProfile }),

  setEmployerProfile: (employerProfile) => set({ employerProfile }),

  loadUserProfile: async (userId: string) => {
    try {
      set({ isLoading: true });

      // Get base user profile
      const { data: userData, error: userError } = await getUserProfile(userId);

      if (userError || !userData) {
        console.error('Error loading user profile:', userError);
        return;
      }

      set({ user: userData as User });

      // Load type-specific profile
      if (userData.type === 'candidate') {
        const { data: candidateData } = await getCandidateProfile(userId);
        if (candidateData) {
          set({ candidateProfile: candidateData as CandidateProfile });
        }
      } else if (userData.type === 'employer') {
        const { data: employerData } = await getEmployerProfile(userId);
        if (employerData) {
          set({ employerProfile: employerData as (Employer & { company: Company }) });
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      get().reset();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  reset: () => {
    set({
      user: null,
      candidateProfile: null,
      employerProfile: null,
      isLoading: false,
    });
  },
}));

// Selector hooks for common patterns
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user);
export const useUserType = () => useAuthStore((state) => state.user?.type);
export const useIsCandidate = () => useAuthStore((state) => state.user?.type === 'candidate');
export const useIsEmployer = () => useAuthStore((state) => state.user?.type === 'employer');
export const useCandidateProfile = () => useAuthStore((state) => state.candidateProfile);
export const useEmployerProfile = () => useAuthStore((state) => state.employerProfile);
export const useCompany = () => useAuthStore((state) => state.employerProfile?.company);
