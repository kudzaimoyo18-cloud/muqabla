import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

const isProduction = process.env.NODE_ENV === 'production';

// Enforce security flags on auth cookies
// Note: httpOnly must be false — @supabase/ssr's browser client reads cookies
// via document.cookie to restore sessions. Security comes from sameSite + secure flags
// and server-side validation via getUser().
function secureCookieOptions(options?: Record<string, unknown>) {
  return {
    ...options,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
  };
}

export function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, secureCookieOptions(options))
          );
        },
      },
    }
  );

  return { supabase, response };
}
