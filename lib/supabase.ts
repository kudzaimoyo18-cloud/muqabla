import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const storage = Platform.OS === 'web' && typeof window === 'undefined'
  ? {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    }
  : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============ AUTH HELPERS ============

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  return { data, error };
}

// ============ USER HELPERS ============

export async function createUserProfile(
  userId: string,
  type: 'candidate' | 'employer',
  fullName: string,
  phone?: string | null,
  email?: string | null
) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      type,
      full_name: fullName,
      phone,
      email,
      language: 'en',
      is_verified: false,
      is_active: true,
    })
    .select()
    .single();

  return { data, error };
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

export async function updateUserProfile(userId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

// ============ CANDIDATE HELPERS ============

export async function createCandidateProfile(userId: string, profileData: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('candidates')
    .insert({
      id: userId,
      ...profileData,
      country: profileData.country || 'UAE',
      willing_relocate: false,
      desired_job_types: [],
      desired_industries: [],
      emirates_id_verified: false,
      linkedin_verified: false,
      profile_views: 0,
      applications_count: 0,
    })
    .select()
    .single();

  return { data, error };
}

export async function getCandidateProfile(userId: string) {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

export async function updateCandidateProfile(userId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('candidates')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

// ============ COMPANY HELPERS ============

export async function createCompany(companyData: Record<string, unknown>) {
  const slug = (companyData.name as string)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const { data, error } = await supabase
    .from('companies')
    .insert({
      ...companyData,
      slug,
      locations: [],
      is_verified: false,
      jobs_posted: 0,
      total_hires: 0,
    })
    .select()
    .single();

  return { data, error };
}

export async function getCompany(companyId: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  return { data, error };
}

// ============ EMPLOYER HELPERS ============

export async function createEmployerProfile(
  userId: string,
  companyId: string,
  profileData: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from('employers')
    .insert({
      id: userId,
      company_id: companyId,
      role: 'admin',
      can_post_jobs: true,
      can_manage_team: true,
      ...profileData,
    })
    .select()
    .single();

  return { data, error };
}

export async function getEmployerProfile(userId: string) {
  const { data, error } = await supabase
    .from('employers')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('id', userId)
    .single();

  return { data, error };
}

// ============ JOB HELPERS ============

export async function getJobsFeed(cursor?: string, limit = 10) {
  let query = supabase
    .from('jobs')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function getJobById(jobId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('id', jobId)
    .single();

  return { data, error };
}

export async function searchJobs(filters: Record<string, unknown>, cursor?: string, limit = 20) {
  let query = supabase
    .from('jobs')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('status', 'active');

  if (filters.query) {
    query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
  }
  if (filters.city) {
    query = query.eq('city', filters.city);
  }
  if (filters.job_type) {
    query = query.eq('job_type', filters.job_type);
  }

  query = query.order('created_at', { ascending: false }).limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;
  return { data, error };
}

// ============ APPLICATION HELPERS ============

export async function createApplication(applicationData: {
  job_id: string;
  candidate_id: string;
  video_id?: string;
  cover_message?: string;
}) {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      ...applicationData,
      status: 'pending',
    })
    .select()
    .single();

  return { data, error };
}

export async function getCandidateApplications(candidateId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      job:jobs(*, company:companies(*))
    `)
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: false });

  return { data, error };
}

// ============ SAVED JOBS ============

export async function saveJob(candidateId: string, jobId: string) {
  const { data, error } = await supabase
    .from('saved_jobs')
    .insert({
      candidate_id: candidateId,
      job_id: jobId,
    })
    .select()
    .single();

  return { data, error };
}

export async function unsaveJob(candidateId: string, jobId: string) {
  const { error } = await supabase
    .from('saved_jobs')
    .delete()
    .eq('candidate_id', candidateId)
    .eq('job_id', jobId);

  return { error };
}

export async function getSavedJobs(candidateId: string) {
  const { data, error } = await supabase
    .from('saved_jobs')
    .select(`
      *,
      job:jobs(*, company:companies(*))
    `)
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: false });

  return { data, error };
}

// ============ VIDEO HELPERS ============

export async function createVideoRecord(videoData: {
  owner_id: string;
  type: 'profile' | 'application' | 'job_post' | 'company_intro';
  duration: number;
  mux_asset_id?: string;
  mux_playback_id?: string;
}) {
  const { data, error } = await supabase
    .from('videos')
    .insert({
      ...videoData,
      status: 'processing',
      skills_detected: [],
    })
    .select()
    .single();

  return { data, error };
}

export async function updateVideoRecord(videoId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('videos')
    .update(updates)
    .eq('id', videoId)
    .select()
    .single();

  return { data, error };
}
