import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(`Missing env vars: URL=${!!url}, KEY=${!!key}`);
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per IP per minute
    const ip = getClientIp(request);
    const { success, resetIn } = rateLimit(`oauth-profile:${ip}`, { maxRequests: 5, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
      );
    }

    // Verify the caller is authenticated and matches the userId
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() {},
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, email, fullName, role, provider, avatarUrl } = await request.json();

    if (!userId || !email || !fullName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const isLinkedin = provider === 'linkedin';

    // Ensure the authenticated user can only create their own profile
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!['candidate', 'employer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Check if user profile already exists
    const { data: existingUser } = await admin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingUser) {
      return NextResponse.json({ success: true, message: 'Profile already exists' });
    }

    // Create public.users profile
    const { error: userError } = await admin
      .from('users')
      .insert({
        id: userId,
        type: role,
        full_name: fullName,
        email,
        avatar_url: avatarUrl || null,
        language: 'en',
        is_verified: false,
        is_active: true,
      });

    if (userError) {
      console.error('User profile error:', userError.message);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    // Create role-specific profile
    if (role === 'candidate') {
      const { error: candError } = await admin
        .from('candidates')
        .insert({
          id: userId,
          country: 'UAE',
          willing_relocate: false,
          desired_job_types: [],
          desired_industries: [],
          emirates_id_verified: false,
          linkedin_verified: isLinkedin,
          linkedin_url: isLinkedin ? `https://linkedin.com/in/${fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : null,
          profile_views: 0,
          applications_count: 0,
        });

      if (candError) {
        console.error('Candidate profile error:', candError.message);
      }
    } else {
      const slug = fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data: company, error: compError } = await admin
        .from('companies')
        .insert({
          name: `${fullName}'s Company`,
          slug,
          locations: [],
          is_verified: false,
          jobs_posted: 0,
          total_hires: 0,
        })
        .select()
        .single();

      if (!compError && company) {
        const { error: empError } = await admin
          .from('employers')
          .insert({
            id: userId,
            company_id: company.id,
            role: 'admin',
            can_post_jobs: true,
            can_manage_team: true,
          });

        if (empError) {
          console.error('Employer profile error:', empError.message);
        }
      } else {
        console.error('Company creation error:', compError?.message);
      }
    }

    return NextResponse.json({
      success: true,
      userId,
      role,
      message: 'Profile created successfully',
    });
  } catch (error: any) {
    console.error('OAuth profile error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
