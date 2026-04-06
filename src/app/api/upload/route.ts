import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase/admin';
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

    // Get video type from query params (default: 'job_intro')
    const { searchParams } = new URL(request.url);
    const videoType = searchParams.get('type') || 'job_intro';

    // Step 1: Get direct upload URL from Cloudflare Stream
    const cfResponse = await fetch(
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

    const cfData = await cfResponse.json();

    if (!cfData.success) {
      console.error('Cloudflare API error:', JSON.stringify(cfData.errors || cfData));
      return NextResponse.json({ error: 'Failed to get upload URL' }, { status: 500 });
    }

    const cloudflareUid = cfData.result.uid;
    const uploadURL = cfData.result.uploadURL;

    // Step 2: Create a record in the videos table (uses admin client to bypass RLS)
    const { data: videoRecord, error: dbError } = await supabaseAdmin
      .from('videos')
      .insert({
        owner_id: user.id,
        type: videoType,
        cloudflare_uid: cloudflareUid,
        status: 'processing',
      })
      .select('id')
      .single();

    if (dbError || !videoRecord) {
      console.error('Failed to create video record:', dbError?.message);
      return NextResponse.json({ error: 'Failed to create video record' }, { status: 500 });
    }

    // Return the videos table UUID (not Cloudflare uid) so it can be used as FK
    return NextResponse.json({
      uploadUrl: uploadURL,
      videoId: videoRecord.id,
      cloudflareUid: cloudflareUid,
    });
  } catch (error: any) {
    console.error('Upload URL error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
