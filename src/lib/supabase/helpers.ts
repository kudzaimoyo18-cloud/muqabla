import { supabase } from './client';

// ============ AUTH HELPERS ============

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signInWithOtp(email: string) {
  return supabase.auth.signInWithOtp({ email });
}

export async function verifyOtp(email: string, token: string) {
  return supabase.auth.verifyOtp({ email, token, type: 'email' });
}

export async function signInWithGoogle(redirectTo: string) {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
}

export async function signInWithLinkedin(redirectTo: string) {
  return supabase.auth.signInWithOAuth({
    provider: 'linkedin_oidc',
    options: { redirectTo },
  });
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function signOut() {
  return supabase.auth.signOut();
}

// ============ USER HELPERS ============

export async function createUserProfile(
  userId: string,
  type: 'candidate' | 'employer',
  fullName: string,
  phone?: string | null,
  email?: string | null
) {
  return supabase
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
}

export async function getUserProfile(userId: string) {
  return supabase.from('users').select('*').eq('id', userId).single();
}

export async function updateUserProfile(userId: string, updates: Record<string, unknown>) {
  return supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
}

// ============ CANDIDATE HELPERS ============

export async function createCandidateProfile(userId: string, profileData: Record<string, unknown>) {
  return supabase
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
}

export async function getCandidateProfile(userId: string) {
  return supabase.from('candidates').select('*, profile_video:profile_video_id (id, cloudflare_uid)').eq('id', userId).single();
}

export async function updateCandidateProfile(userId: string, updates: Record<string, unknown>) {
  return supabase.from('candidates').update(updates).eq('id', userId).select().single();
}

// ============ EMPLOYER HELPERS ============

export async function getEmployerProfile(userId: string) {
  return supabase
    .from('employers')
    .select('*, company:companies(*, intro_video:intro_video_id (id, cloudflare_uid))')
    .eq('id', userId)
    .single();
}

export async function createCompany(companyData: Record<string, unknown>) {
  const slug = (companyData.name as string)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return supabase
    .from('companies')
    .insert({ ...companyData, slug, locations: [], is_verified: false, jobs_posted: 0, total_hires: 0 })
    .select()
    .single();
}

export async function createEmployerProfile(userId: string, companyId: string, profileData: Record<string, unknown>) {
  return supabase
    .from('employers')
    .insert({ id: userId, company_id: companyId, role: 'admin', can_post_jobs: true, can_manage_team: true, ...profileData })
    .select()
    .single();
}

export async function updateCompanyProfile(companyId: string, updates: Record<string, unknown>) {
  return supabase.from('companies').update(updates).eq('id', companyId).select().single();
}

// ============ JOB HELPERS ============

export async function getJobsFeed(cursor?: string, limit = 10) {
  let query = supabase
    .from('jobs')
    .select('*, company:companies(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  return query;
}

// Escape special characters for PostgREST ilike filters
function sanitizeSearchInput(input: string): string {
  return input
    .replace(/\\/g, '\\\\')  // escape backslashes first
    .replace(/%/g, '\\%')    // escape wildcard %
    .replace(/_/g, '\\_')    // escape wildcard _
    .replace(/[(),."']/g, '') // strip characters that could break PostgREST filter syntax
    .trim()
    .slice(0, 200);           // limit length to prevent abuse
}

export async function searchJobs(filters: Record<string, unknown>, limit = 20) {
  let query = supabase
    .from('jobs')
    .select('*, company:companies(*)')
    .eq('status', 'active');

  if (filters.query && typeof filters.query === 'string' && filters.query.trim()) {
    const q = sanitizeSearchInput(filters.query);
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }
  }
  if (filters.city && typeof filters.city === 'string') {
    query = query.ilike('city', `%${sanitizeSearchInput(filters.city)}%`);
  }
  if (filters.job_type && typeof filters.job_type === 'string') {
    query = query.eq('job_type', filters.job_type);
  }
  if (filters.work_mode && typeof filters.work_mode === 'string') {
    query = query.eq('work_mode', filters.work_mode);
  }

  return query.order('created_at', { ascending: false }).limit(Math.min(limit, 100));
}

// ============ APPLICATION HELPERS ============

export async function createApplication(data: { job_id: string; candidate_id: string; video_id?: string; cover_message?: string }) {
  return supabase.from('applications').insert({ ...data, status: 'pending' }).select().single();
}

// ============ SAVED JOBS ============

export async function saveJob(candidateId: string, jobId: string) {
  return supabase.from('saved_jobs').insert({ candidate_id: candidateId, job_id: jobId }).select().single();
}

export async function unsaveJob(candidateId: string, jobId: string) {
  return supabase.from('saved_jobs').delete().eq('candidate_id', candidateId).eq('job_id', jobId);
}

// ============ VIDEO HELPERS ============

export async function createVideoRecord(videoData: {
  owner_id: string;
  type: 'profile' | 'application' | 'job_post' | 'company_intro';
  duration: number;
}) {
  return supabase
    .from('videos')
    .insert({ ...videoData, status: 'processing', skills_detected: [], ai_analyzed: false })
    .select()
    .single();
}

export async function updateVideoRecord(videoId: string, updates: Record<string, unknown>) {
  return supabase.from('videos').update(updates).eq('id', videoId).select().single();
}

// ============ MESSAGING HELPERS ============

export async function getOrCreateConversation(applicationId: string) {
  // Check if conversation exists for this application
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('application_id', applicationId)
    .single();

  if (existing) return { data: existing, error: null };

  // Create new conversation
  return supabase
    .from('conversations')
    .insert({ application_id: applicationId })
    .select('id')
    .single();
}

export async function getConversationMessages(conversationId: string) {
  return supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  return supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content: content.trim() })
    .select()
    .single();
}

export async function markMessagesRead(conversationId: string, userId: string) {
  return supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false);
}
