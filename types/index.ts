// Muqabla TypeScript Types

// ============ USER TYPES ============

export type UserType = 'candidate' | 'employer';
export type Language = 'en' | 'ar';

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  type: UserType;
  full_name: string;
  full_name_ar?: string;
  avatar_url?: string;
  language: Language;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============ CANDIDATE TYPES ============

export interface Candidate extends User {
  type: 'candidate';
  profile: CandidateProfile;
}

export interface CandidateProfile {
  id: string;
  headline?: string;
  headline_ar?: string;
  current_title?: string;
  current_company?: string;
  years_experience?: number;
  city?: string;
  country: string;
  willing_relocate: boolean;
  desired_salary_min?: number;
  desired_salary_max?: number;
  desired_job_types: string[];
  desired_industries: string[];
  profile_video_id?: string;
  profile_video?: Video;
  emirates_id_verified: boolean;
  linkedin_url?: string;
  linkedin_verified: boolean;
  profile_views: number;
  applications_count: number;
}

// ============ EMPLOYER TYPES ============

export interface Employer extends User {
  type: 'employer';
  company_id: string;
  company?: Company;
  role: 'admin' | 'recruiter';
  title?: string;
  can_post_jobs: boolean;
  can_manage_team: boolean;
}

export interface Company {
  id: string;
  name: string;
  name_ar?: string;
  slug: string;
  logo_url?: string;
  cover_image_url?: string;
  industry?: string;
  size?: string;
  founded_year?: number;
  website?: string;
  description?: string;
  description_ar?: string;
  headquarters?: string;
  locations: string[];
  trade_license?: string;
  is_verified: boolean;
  verified_at?: string;
  intro_video_id?: string;
  intro_video?: Video;
  jobs_posted: number;
  total_hires: number;
  response_rate?: number;
  avg_response_time?: number;
  created_at: string;
}

// ============ VIDEO TYPES ============

export type VideoType = 'profile' | 'application' | 'job_post' | 'company_intro';
export type VideoStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export interface Video {
  id: string;
  owner_id: string;
  type: VideoType;
  duration: number;
  thumbnail_url?: string;
  mux_asset_id?: string;
  mux_playback_id?: string;
  status: VideoStatus;
  transcript?: string;
  transcript_ar?: string;
  language?: string;
  skills_detected: string[];
  created_at: string;
}

// ============ JOB TYPES ============

export type JobStatus = 'draft' | 'active' | 'paused' | 'closed';
export type JobType = 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship';
export type WorkMode = 'on_site' | 'remote' | 'hybrid';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';

export interface Job {
  id: string;
  company_id: string;
  company?: Company;
  posted_by: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  requirements: string[];
  requirements_ar: string[];
  department?: string;
  seniority?: ExperienceLevel;
  job_type: JobType;
  work_mode: WorkMode;
  city: string;
  country: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  show_salary: boolean;
  benefits: string[];
  video_id?: string;
  video?: Video;
  status: JobStatus;
  views: number;
  applications_count: number;
  created_at: string;
  published_at?: string;
  expires_at?: string;
}

// Job with all relations loaded (for feed)
export interface JobWithDetails extends Job {
  company: Company;
  video: Video;
}

// ============ APPLICATION TYPES ============

export type ApplicationStatus =
  | 'pending'
  | 'viewed'
  | 'shortlisted'
  | 'interviewing'
  | 'offered'
  | 'hired'
  | 'rejected';

export interface Application {
  id: string;
  job_id: string;
  job?: Job;
  candidate_id: string;
  candidate?: CandidateProfile;
  video_id: string;
  video?: Video;
  cover_message?: string;
  status: ApplicationStatus;
  match_score?: number;
  viewed_at?: string;
  shortlisted_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

// ============ SAVED JOBS ============

export interface SavedJob {
  candidate_id: string;
  job_id: string;
  job?: Job;
  created_at: string;
}

// ============ MESSAGING ============

export interface Conversation {
  id: string;
  application_id: string;
  application?: Application;
  created_at: string;
  last_message?: Message;
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender?: User;
  content: string;
  is_read: boolean;
  created_at: string;
}

// ============ API RESPONSE TYPES ============

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// ============ FORM TYPES ============

export interface RegisterFormData {
  phone: string;
  type: UserType;
}

export interface CandidateOnboardingData {
  full_name: string;
  headline?: string;
  city: string;
  country: string;
  years_experience?: number;
  desired_industries: string[];
}

export interface EmployerOnboardingData {
  full_name: string;
  title: string;
  company_name: string;
  industry: string;
  size: string;
  website?: string;
}

export interface JobPostFormData {
  title: string;
  title_ar?: string;
  description?: string;
  requirements: string[];
  department?: string;
  seniority?: ExperienceLevel;
  job_type: JobType;
  work_mode: WorkMode;
  city: string;
  country: string;
  salary_min?: number;
  salary_max?: number;
  show_salary: boolean;
  benefits: string[];
}

// ============ FILTER TYPES ============

export interface JobFilters {
  query?: string;
  city?: string;
  country?: string;
  industry?: string;
  job_type?: JobType;
  work_mode?: WorkMode;
  seniority?: ExperienceLevel;
  salary_min?: number;
  salary_max?: number;
}

export interface CandidateFilters {
  query?: string;
  city?: string;
  years_experience_min?: number;
  years_experience_max?: number;
  industries?: string[];
}
