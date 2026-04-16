import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase env vars');
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Allowlisted fields that can be updated on the companies table
const ALLOWED_FIELDS = new Set([
  'name', 'industry', 'size', 'founded_year', 'website',
  'description', 'headquarters', 'intro_video_id', 'logo_url',
]);

export async function PATCH(request: NextRequest) {
  try {
    // Rate limit: 20 requests per IP per minute
    const ip = getClientIp(request);
    const { success, resetIn } = rateLimit(`employer-company:${ip}`, { maxRequests: 20, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
      );
    }

    // Verify the caller is authenticated
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

    const { companyId, updates } = await request.json();

    if (!companyId || typeof companyId !== 'string') {
      return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
    }
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
      return NextResponse.json({ error: 'Missing or invalid updates' }, { status: 400 });
    }

    const admin = getAdminClient();

    // Verify this user is an employer linked to this company
    const { data: employer } = await admin
      .from('employers')
      .select('id, company_id')
      .eq('id', user.id)
      .eq('company_id', companyId)
      .single();

    if (!employer) {
      return NextResponse.json({ error: 'Forbidden: not linked to this company' }, { status: 403 });
    }

    // Filter updates to only allowed fields
    const safeUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (ALLOWED_FIELDS.has(key)) {
        safeUpdates[key] = value;
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Perform the update with admin client (bypasses RLS)
    const { data, error } = await admin
      .from('companies')
      .update(safeUpdates)
      .eq('id', companyId)
      .select()
      .single();

    if (error) {
      console.error('Company update error:', error.message);
      return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Employer company API error:', err?.message || err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
