import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') || '/feed';

  // Build the final redirect URL (may be overridden for new OAuth users)
  let redirectUrl = new URL(redirect, request.url);
  const response = NextResponse.redirect(redirectUrl);

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: sessionData } = await supabase.auth.exchangeCodeForSession(code);

    // For new OAuth users, check if they have a profile in public.users
    if (sessionData?.user) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', sessionData.user.id)
        .single();

      if (!existingUser) {
        // New user — redirect to role selection (keep the auth cookies!)
        const roleUrl = new URL('/auth/role', request.url);
        const roleResponse = NextResponse.redirect(roleUrl);
        // Copy auth cookies from the original response
        response.cookies.getAll().forEach((cookie) => {
          roleResponse.cookies.set(cookie.name, cookie.value);
        });
        return roleResponse;
      }
    }
  }

  return response;
}
