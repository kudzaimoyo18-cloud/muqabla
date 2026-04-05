import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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

export async function POST(request: Request) {
  try {
    // Rate limit: 5 signups per IP per minute
    const ip = getClientIp(request);
    const { success, resetIn } = rateLimit(`signup:${ip}`, { maxRequests: 5, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
      );
    }

    const body = await request.text();
    let email: string, password: string, fullName: string, role: string; /* eslint-disable-line prefer-const */

    try {
      const parsed = JSON.parse(body);
      email = parsed.email;
      password = parsed.password;
      fullName = parsed.fullName;
      role = parsed.role;
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr, 'Body:', body.substring(0, 200));
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate password strength
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: 'Password must be 8-128 characters' }, { status: 400 });
    }

    // Sanitize full name — strip HTML/script tags, limit length
    if (typeof fullName !== 'string' || fullName.trim().length < 1 || fullName.length > 200) {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }
    fullName = fullName.replace(/<[^>]*>/g, '').trim();

    if (!['candidate', 'employer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const admin = getAdminClient();

    // 1. Create auth user with auto-confirm (bypasses email confirmation & rate limits)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });

    if (authError) {
      console.error('Auth create error:', authError.message);
      // Only expose safe error messages to the client
      const safeMessage = authError.message?.includes('already registered')
        ? 'An account with this email already exists'
        : 'Failed to create account';
      return NextResponse.json({ error: safeMessage }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Create public.users profile
    const { error: userError } = await admin
      .from('users')
      .insert({
        id: userId,
        type: role,
        full_name: fullName,
        email,
        language: 'en',
        is_verified: false,
        is_active: true,
      });

    if (userError) {
      console.error('User profile error:', userError.message);
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    // 3. Create role-specific profile
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
          linkedin_verified: false,
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
      message: 'Account created successfully',
    });
  } catch (error: any) {
    console.error('Signup error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
