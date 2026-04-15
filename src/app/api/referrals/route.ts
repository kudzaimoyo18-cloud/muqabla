import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function getServerClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() {},
      },
    }
  );
}

// GET /api/referrals — list current user's referrals
export async function GET(request: NextRequest) {
  try {
    const supabase = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getAdminClient();
    const { data: referrals, error } = await admin
      .from('referrals')
      .select('*, job:jobs(id, title, company_id)')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch referrals error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
    }

    // Get stats
    const stats = {
      total: referrals?.length || 0,
      signed_up: referrals?.filter(r => r.status === 'signed_up').length || 0,
      applied: referrals?.filter(r => r.status === 'applied').length || 0,
      hired: referrals?.filter(r => r.status === 'hired').length || 0,
    };

    return NextResponse.json({ referrals, stats });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/referrals — create a new referral link
export async function POST(request: NextRequest) {
  try {
    const supabase = getServerClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { referredEmail, jobId } = await request.json();

    if (!referredEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(referredEmail)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Can't refer yourself
    if (referredEmail.toLowerCase() === user.email?.toLowerCase()) {
      return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Check for duplicate referral
    const { data: existing } = await admin
      .from('referrals')
      .select('id')
      .eq('referrer_id', user.id)
      .eq('referred_email', referredEmail.toLowerCase())
      .eq('job_id', jobId || null)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'You already referred this person for this job' }, { status: 409 });
    }

    // Generate unique referral code (8 chars, URL-safe)
    const referralCode = randomBytes(6).toString('base64url').slice(0, 8);

    const { data: referral, error } = await admin
      .from('referrals')
      .insert({
        referrer_id: user.id,
        referred_email: referredEmail.toLowerCase(),
        job_id: jobId || null,
        referral_code: referralCode,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Create referral error:', error.message);
      return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabla-mocha.vercel.app';
    const referralLink = jobId
      ? `${baseUrl}/auth/signup?ref=${referralCode}&job=${jobId}`
      : `${baseUrl}/auth/signup?ref=${referralCode}`;

    return NextResponse.json({
      referral,
      referralLink,
      referralCode,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
