import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const isProduction = process.env.NODE_ENV === 'production';

function secureCookieOptions(options?: Record<string, unknown>) {
  return {
    ...options,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const rawRedirect = searchParams.get('redirect') || '/feed';

  // Only allow relative paths — prevent open redirect attacks
  const redirect = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/feed';
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
              response.cookies.set(name, value, secureCookieOptions(options))
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
        .select('id, avatar_url')
        .eq('id', sessionData.user.id)
        .single();

      if (!existingUser) {
        // New user — redirect to role selection (keep the auth cookies!)
        // Pass the provider so we can set linkedin_verified if they signed in via LinkedIn
        const provider = sessionData.user.app_metadata?.provider || '';
        const roleUrl = new URL('/auth/role', request.url);
        if (provider === 'linkedin_oidc') {
          roleUrl.searchParams.set('provider', 'linkedin');
        }
        const roleResponse = NextResponse.redirect(roleUrl);
        // Copy auth cookies with security flags
        response.cookies.getAll().forEach((cookie) => {
          roleResponse.cookies.set(cookie.name, cookie.value, secureCookieOptions());
        });
        return roleResponse;
      } else {
        // Returning user — sync avatar from OAuth if not set yet
        const oauthAvatar = sessionData.user.user_metadata?.avatar_url
          || sessionData.user.user_metadata?.picture
          || null;
        if (oauthAvatar && !existingUser.avatar_url) {
          await supabase
            .from('users')
            .update({ avatar_url: oauthAvatar })
            .eq('id', sessionData.user.id);
        }
      }
    }
  }

  return response;
}
