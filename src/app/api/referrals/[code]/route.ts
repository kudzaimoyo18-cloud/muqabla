import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/referrals/[code] — public lookup for referral code (used on signup page)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    if (!code || code.length < 6 || code.length > 12) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: referral, error } = await admin
      .from('referrals')
      .select('id, referral_code, job_id, referrer:users!referrer_id(full_name, avatar_url)')
      .eq('referral_code', code)
      .eq('status', 'pending')
      .single();

    if (error || !referral) {
      return NextResponse.json({ error: 'Referral not found or already used' }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      referralCode: referral.referral_code,
      jobId: referral.job_id,
      referrerName: (referral as any).referrer?.full_name || 'A Muqabla user',
      referrerAvatar: (referral as any).referrer?.avatar_url || null,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
