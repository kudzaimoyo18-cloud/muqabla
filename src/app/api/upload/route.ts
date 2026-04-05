import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 uploads per IP per 5 minutes
    const ip = getClientIp(request);
    const { success, resetIn } = rateLimit(`upload:${ip}`, { maxRequests: 10, windowMs: 5 * 60_000 });
    if (!success) {
      return NextResponse.json(
        { error: 'Too many upload requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
      );
    }

    // Authenticate the request
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
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      console.error('Missing Cloudflare env vars:', { accountId: !!accountId, apiToken: !!apiToken });
      return NextResponse.json({ error: 'Video upload not configured' }, { status: 500 });
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maxDurationSeconds: 300, requireSignedURLs: false }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      console.error('Cloudflare API error:', JSON.stringify(data.errors || data));
      return NextResponse.json({ error: 'Failed to get upload URL' }, { status: 500 });
    }

    return NextResponse.json({
      uploadUrl: data.result.uploadURL,
      videoId: data.result.uid,
    });
  } catch (error: any) {
    console.error('Upload URL error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
