import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ssttxhadegoyiianjitw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzdHR4aGFkZWdveWlpYW5jqXR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDI1NDYsImV4cCI6MjA4NTc3ODU0Nn0.AkJKe2PhGjRLFOmW7elbCQFjexqaJxfzHP7N5K596WE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)

  if (error) throw error
  return data
}

export async function getJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, company:companies(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getJobById(id: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, company:companies(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getApplications(userId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, job:jobs(*, company:companies(*))')
    .eq('candidate_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function applyToJob(jobId: string, candidateId: string, videoId: string, coverMessage: string) {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      candidate_id: candidateId,
      video_id: videoId,
      cover_message: coverMessage,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return data
}