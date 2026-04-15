export interface User {
  id: string
  email: string
  phone?: string
  type: 'candidate' | 'employer'
  full_name: string
  full_name_ar: string
  avatar_url?: string
  language: 'en' | 'ar'
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Candidate {
  id: string
  user_id: string
  headline: string
  headline_ar: string
  current_title: string
  current_company: string
  years_experience: number
  city: string
  country: string
  willing_relocate: boolean
  desired_salary_min?: number
  desired_salary_max?: number
  desired_job_types: string[]
  desired_industries: string[]
  profile_video_id?: string
  emirates_id_verified?: boolean
  linkedin_url?: string
  linkedin_verified?: boolean
  profile_views: number
  applications_count: number
}

export interface Company {
  id: string
  name: string
  name_ar: string
  slug: string
  logo_url?: string
  cover_image_url?: string
  industry: string
  size: string
  founded_year?: number
  website?: string
  description: string
  description_ar: string
  headquarters: string
  locations: string[]
  trade_license?: string
  is_verified: boolean
  verified_at?: string
  intro_video_id?: string
  jobs_posted: number
  total_hires: number
  response_rate: number
  avg_response_time: number
  created_at: string
}

export interface Employer {
  id: string
  user_id: string
  company_id: string
  role: 'admin' | 'recruiter'
  title: string
  can_post_jobs: boolean
  can_manage_team: boolean
}

export interface Job {
  id: string
  company_id: string
  posted_by: string
  title: string
  title_ar: string
  description: string
  description_ar: string
  requirements: string[]
  requirements_ar: string[]
  department: string
  seniority: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  job_type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship'
  work_mode: 'on_site' | 'remote' | 'hybrid'
  city: string
  country: string
  salary_min?: number
  salary_max?: number
  salary_currency: string
  show_salary: boolean
  benefits: string[]
  video_id?: string
  status: 'draft' | 'active' | 'paused' | 'closed'
  views: number
  applications_count: number
  created_at: string
  published_at?: string
  expires_at?: string
}

export interface Application {
  id: string
  job_id: string
  candidate_id: string
  video_id: string
  cover_message: string
  status: 'pending' | 'viewed' | 'shortlisted' | 'interviewing' | 'offered' | 'hired' | 'rejected'
  match_score?: number
  viewed_at?: string
  shortlisted_at?: string
  rejected_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  owner_id: string
  type: 'profile' | 'application' | 'job_post' | 'company_intro'
  duration: number
  thumbnail_url?: string
  mux_asset_id?: string
  mux_playback_id?: string
  status: 'uploading' | 'processing' | 'ready' | 'failed'
  transcript?: string
  transcript_ar?: string
  language: string
  skills_detected?: string[]
  created_at: string
}

export interface Country {
  code: string
  name: string
  name_ar: string
}

export interface City {
  country_code: string
  name: string
  name_ar: string
}

export interface Industry {
  name: string
  name_ar: string
}

export interface ExperienceLevel {
  level: string
  level_ar: string
  years_min: number
  years_max: number
}

export interface CompanySize {
  size: string
  size_ar: string
  min_employees: number
  max_employees: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_email: string
  referred_user_id?: string
  job_id?: string
  referral_code: string
  status: 'pending' | 'signed_up' | 'applied' | 'hired'
  created_at: string
  converted_at?: string
  // joined data
  job?: Pick<Job, 'id' | 'title' | 'company_id'>
  referred_user?: Pick<User, 'id' | 'full_name' | 'avatar_url'>
}