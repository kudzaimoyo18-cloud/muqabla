import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json().catch(() => ({}));
    const { storagePath, type } = body;

    if (!storagePath) {
      return NextResponse.json({ error: 'Missing storagePath' }, { status: 400 });
    }

    // Create video record
    const { data: videoRecord, error: dbError } = await supabaseAdmin
      .from('videos')
      .insert({
        owner_id: user.id,
        type: type || 'job_post',
        cloudflare_uid: `supabase://${storagePath}`,
        status: 'ready',
        duration: 0,
      })
      .select('id')
      .single();

    if (dbError || !videoRecord) {
      console.error('Failed to create video record:', dbError?.message);
      return NextResponse.json({ error: 'Failed to create video record' }, { status: 500 });
    }

    return NextResponse.json({ videoId: videoRecord.id });
  } catch (error: any) {
    console.error('Upload error:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
