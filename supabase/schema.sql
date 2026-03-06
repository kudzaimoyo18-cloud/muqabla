-- =============================================
-- MUQABLA DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('candidate', 'employer')),
    email VARCHAR(255),
    phone VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    full_name VARCHAR(255) NOT NULL,
    full_name_ar VARCHAR(255),
    avatar_url VARCHAR(500),
    language VARCHAR(5) DEFAULT 'en' CHECK (language IN ('en', 'ar')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- VIDEOS TABLE (shared across all video types)
-- =============================================
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('profile', 'application', 'job_post', 'company_intro')),
    duration INTEGER NOT NULL,
    thumbnail_url VARCHAR(500),
    mux_asset_id VARCHAR(255),
    mux_playback_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('uploading', 'processing', 'ready', 'failed')),
    transcript TEXT,
    transcript_ar TEXT,
    language VARCHAR(10),
    skills_detected TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CANDIDATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(255),
    headline_ar VARCHAR(255),
    current_title VARCHAR(255),
    current_company VARCHAR(255),
    years_experience INTEGER,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'UAE',
    willing_relocate BOOLEAN DEFAULT FALSE,
    desired_salary_min INTEGER,
    desired_salary_max INTEGER,
    desired_job_types TEXT[] DEFAULT '{}',
    desired_industries TEXT[] DEFAULT '{}',
    profile_video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
    emirates_id_verified BOOLEAN DEFAULT FALSE,
    linkedin_url VARCHAR(500),
    linkedin_verified BOOLEAN DEFAULT FALSE,
    profile_views INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0
);

-- =============================================
-- COMPANIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    slug VARCHAR(255) UNIQUE,
    logo_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    industry VARCHAR(100),
    size VARCHAR(50),
    founded_year INTEGER,
    website VARCHAR(500),
    description TEXT,
    description_ar TEXT,
    headquarters VARCHAR(255),
    locations TEXT[] DEFAULT '{}',
    trade_license VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    intro_video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
    jobs_posted INTEGER DEFAULT 0,
    total_hires INTEGER DEFAULT 0,
    response_rate DECIMAL(5,2),
    avg_response_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- EMPLOYERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS employers (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'recruiter')),
    title VARCHAR(255),
    can_post_jobs BOOLEAN DEFAULT TRUE,
    can_manage_team BOOLEAN DEFAULT FALSE
);

-- =============================================
-- JOBS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    posted_by UUID REFERENCES employers(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    requirements TEXT[] DEFAULT '{}',
    requirements_ar TEXT[] DEFAULT '{}',
    department VARCHAR(100),
    seniority VARCHAR(50) CHECK (seniority IN ('entry', 'mid', 'senior', 'lead', 'executive')),
    job_type VARCHAR(50) CHECK (job_type IN ('full_time', 'part_time', 'contract', 'freelance', 'internship')),
    work_mode VARCHAR(50) CHECK (work_mode IN ('on_site', 'remote', 'hybrid')),
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'UAE',
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(10) DEFAULT 'AED',
    show_salary BOOLEAN DEFAULT TRUE,
    benefits TEXT[] DEFAULT '{}',
    video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed')),
    views INTEGER DEFAULT 0,
    applications_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- APPLICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
    cover_message TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'shortlisted', 'interviewing', 'offered', 'hired', 'rejected')),
    match_score DECIMAL(5,2),
    viewed_at TIMESTAMP WITH TIME ZONE,
    shortlisted_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, candidate_id)
);

-- =============================================
-- SAVED JOBS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS saved_jobs (
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (candidate_id, job_id)
);

-- =============================================
-- CONVERSATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_type ON users(type);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_candidates_city ON candidates(city);
CREATE INDEX IF NOT EXISTS idx_candidates_country ON candidates(country);

CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_verified ON companies(is_verified);

CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_city ON jobs(city);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_work_mode ON jobs(work_mode);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE INDEX IF NOT EXISTS idx_videos_owner ON videos(owner_id);
CREATE INDEX IF NOT EXISTS idx_videos_type ON videos(type);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Candidates policies
CREATE POLICY "Candidates can view their own profile" ON candidates
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Candidates can update their own profile" ON candidates
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Candidates can insert their own profile" ON candidates
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Employers can view candidate profiles" ON candidates
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND type = 'employer')
    );

-- Companies policies
CREATE POLICY "Anyone can view companies" ON companies
    FOR SELECT USING (true);
CREATE POLICY "Employers can update their company" ON companies
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM employers WHERE id = auth.uid() AND company_id = companies.id)
    );
CREATE POLICY "Authenticated users can create companies" ON companies
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Employers policies
CREATE POLICY "Employers can view their own profile" ON employers
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Employers can update their own profile" ON employers
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Employers can insert their own profile" ON employers
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Jobs policies
CREATE POLICY "Anyone can view active jobs" ON jobs
    FOR SELECT USING (status = 'active');
CREATE POLICY "Employers can view their company jobs" ON jobs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM employers WHERE id = auth.uid() AND company_id = jobs.company_id)
    );
CREATE POLICY "Employers can create jobs for their company" ON jobs
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM employers WHERE id = auth.uid() AND company_id = jobs.company_id AND can_post_jobs = true)
    );
CREATE POLICY "Employers can update their company jobs" ON jobs
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM employers WHERE id = auth.uid() AND company_id = jobs.company_id)
    );

-- Applications policies
CREATE POLICY "Candidates can view their applications" ON applications
    FOR SELECT USING (candidate_id = auth.uid());
CREATE POLICY "Candidates can create applications" ON applications
    FOR INSERT WITH CHECK (candidate_id = auth.uid());
CREATE POLICY "Employers can view applications for their jobs" ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM jobs j
            JOIN employers e ON e.company_id = j.company_id
            WHERE j.id = applications.job_id AND e.id = auth.uid()
        )
    );
CREATE POLICY "Employers can update application status" ON applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM jobs j
            JOIN employers e ON e.company_id = j.company_id
            WHERE j.id = applications.job_id AND e.id = auth.uid()
        )
    );

-- Videos policies
CREATE POLICY "Users can view their own videos" ON videos
    FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "Users can create their own videos" ON videos
    FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update their own videos" ON videos
    FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Anyone can view public videos" ON videos
    FOR SELECT USING (
        type IN ('job_post', 'company_intro') OR
        (type = 'profile' AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND type = 'employer'))
    );

-- Saved jobs policies
CREATE POLICY "Candidates can manage their saved jobs" ON saved_jobs
    FOR ALL USING (candidate_id = auth.uid());

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Increment job applications count
CREATE OR REPLACE FUNCTION increment_applications_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE jobs SET applications_count = applications_count + 1 WHERE id = NEW.job_id;
    UPDATE candidates SET applications_count = applications_count + 1 WHERE id = NEW.candidate_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_application_created
    AFTER INSERT ON applications
    FOR EACH ROW
    EXECUTE FUNCTION increment_applications_count();

-- Increment job views
CREATE OR REPLACE FUNCTION increment_job_views(job_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE jobs SET views = views + 1 WHERE id = job_uuid;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================

-- Uncomment below to insert sample data

/*
-- Sample company
INSERT INTO companies (id, name, slug, industry, size, headquarters, description, is_verified)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'TechCorp Dubai',
    'techcorp-dubai',
    'Technology',
    '51-200',
    'Dubai, UAE',
    'Leading technology solutions provider in the GCC region.',
    true
);

-- Sample job (requires a company and employer)
INSERT INTO jobs (company_id, title, description, job_type, work_mode, city, country, salary_min, salary_max, status, published_at)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'Senior Software Engineer',
    'We are looking for an experienced software engineer to join our team.',
    'full_time',
    'hybrid',
    'Dubai',
    'UAE',
    25000,
    40000,
    'active',
    NOW()
);
*/
