# Muqabla Security Checklist

> Last updated: 2026-04-04
> Status: Pre-production audit

---

## Priority Legend
- **P0 — CRITICAL**: Must fix before any real users touch the app
- **P1 — HIGH**: Fix before public launch
- **P2 — MEDIUM**: Fix within first sprint post-launch
- **P3 — LOW**: Nice to have, schedule when possible

---

## 1. Authentication & Session Management

| # | Item | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 1.1 | Migrate all Supabase clients to `@supabase/ssr` (cookie-based sessions) | P0 | DONE | Was using localStorage; middleware couldn't read sessions |
| 1.2 | Middleware protects all authenticated routes | P0 | DONE | `/feed`, `/search`, `/profile`, `/messages`, `/employer`, `/dashboard` |
| 1.3 | Add auth check to ALL API routes (`/api/*`) | P0 | DONE | Added auth to `/api/upload` and `/api/auth/oauth-profile` |
| 1.4 | Validate OAuth `state` parameter in callback to prevent CSRF | P1 | TODO | Supabase handles this internally via PKCE, but verify it's enabled |
| 1.5 | Sanitize `redirect` query param in callback route (open redirect) | P1 | DONE | Restricted to relative paths starting with `/` (not `//`) |
| 1.6 | Set explicit cookie security flags (`Secure`, `HttpOnly`, `SameSite=Lax`) | P1 | DONE | `secureCookieOptions()` enforced in middleware, server, and callback clients |
| 1.7 | Enforce password complexity (min 8 chars, mixed case, number) | P2 | PARTIAL | Server-side enforces 8-128 char length; mixed case/number not yet required |
| 1.8 | Add account lockout after N failed login attempts | P2 | TODO | Supabase GoTrue has some built-in protection, verify config |
| 1.9 | Session timeout / refresh token rotation configured | P2 | TODO | Check Supabase dashboard → Auth → Settings |

---

## 2. API Route Security

| # | Item | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 2.1 | **`POST /api/upload`** — require authenticated user | P0 | DONE | Added `getUser()` auth check |
| 2.2 | **`POST /api/auth/oauth-profile`** — verify caller is the same user as `userId` | P0 | DONE | Added auth + `userId !== user.id` check → 403 |
| 2.3 | **`POST /api/auth/signup`** — add rate limiting | P0 | DONE | 5 req/min per IP; also added to oauth-profile (5/min) and upload (10/5min) |
| 2.4 | Add request body size limits to all API routes | P1 | TODO | Prevent DoS via oversized JSON payloads |
| 2.5 | Return generic error messages (don't leak implementation details) | P1 | DONE | All API routes now return generic messages, details only in server logs |
| 2.6 | Add CORS headers to API routes (restrict to app domain only) | P2 | TODO | Currently relies on Next.js defaults |

---

## 3. Input Validation & Sanitization

| # | Item | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 3.1 | Validate email format server-side in signup route | P1 | DONE | Regex validation + 254 char limit |
| 3.2 | Sanitize `fullName` before DB insertion (XSS prevention) | P1 | DONE | HTML tags stripped, length limited to 200 chars |
| 3.3 | Fix potential injection in search query helper | P1 | DONE | Added `sanitizeSearchInput()` — escapes `%`, `_`, `\`, strips syntax chars, 200 char limit |
| 3.4 | Validate `role` is strictly `candidate` or `employer` | P1 | DONE | Both signup and oauth-profile check `['candidate', 'employer'].includes(role)` |
| 3.5 | Add Zod or similar schema validation to all API inputs | P2 | TODO | Replace manual `if (!field)` checks with proper schemas |
| 3.6 | Validate company slug generation doesn't produce collisions | P2 | TODO | `oauth-profile` generates slug from name — could collide |

---

## 4. Service Role Key / Admin Client

| # | Item | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 4.1 | Verify `SUPABASE_SERVICE_ROLE_KEY` is only in Vercel env vars (not client-accessible) | P0 | CHECK | Key must NEVER have `NEXT_PUBLIC_` prefix |
| 4.2 | Audit all uses of `getAdminClient()` / `supabaseAdmin` | P0 | TODO | Used in: `/api/auth/signup`, `/api/auth/oauth-profile`, `admin.ts` |
| 4.3 | Add auth verification BEFORE using admin client in API routes | P0 | DONE | oauth-profile verifies `user.id === userId`; signup creates new users (no existing session) |
| 4.4 | Consider replacing admin client with RLS policies where possible | P1 | TODO | Admin bypass should be last resort, not default |

---

## 5. Row Level Security (RLS)

| # | Item | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 5.1 | Verify RLS is enabled on ALL tables | P0 | DONE | All 12 tables have RLS enabled |
| 5.2 | Users can only read/update their own profile | P0 | DONE | `auth.uid() = id` for INSERT/SELECT/UPDATE on `users` |
| 5.3 | Candidates can only read/update their own candidate profile | P0 | DONE | `auth.uid() = id` on `candidates` + employers can view via applications join |
| 5.4 | Employers can only manage their own company's jobs | P0 | DONE | `posted_by = auth.uid()` for INSERT/UPDATE on `jobs` |
| 5.5 | Applications: candidates see their own, employers see for their jobs | P0 | DONE | Two policies: candidate_id match + jobs.posted_by join |
| 5.6 | Messages: only conversation participants can read/write | P0 | DONE | Join through `conversations` → `applications` → `jobs` |
| 5.7 | Saved jobs: users can only manage their own saves | P1 | DONE | INSERT/SELECT/DELETE with `auth.uid() = candidate_id` |
| 5.8 | Jobs table: public read, authenticated insert (employers only) | P1 | DONE | SELECT active only, INSERT/UPDATE by posted_by |
| 5.9 | Test RLS policies by attempting cross-user data access | P1 | TODO | Use Supabase SQL editor with different JWTs |

---

## 6. Video Upload Security (Cloudflare Stream)

| # | Item | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 6.1 | Require authentication for upload URL requests | P0 | DONE | Auth + rate limiting (10/5min) added |
| 6.2 | Enable `requireSignedURLs: true` for video playback | P1 | TODO | Currently `false` — all videos publicly accessible by ID |
| 6.3 | Limit uploads per user (e.g., max 5 active videos) | P1 | TODO | Prevent abuse / cost explosion |
| 6.4 | Validate video duration server-side (currently 300s max) | P2 | PARTIAL | Set in Cloudflare request, but not enforced after upload |
| 6.5 | Add video content moderation (Cloudflare Stream has built-in) | P2 | TODO | Flag inappropriate content |
| 6.6 | Delete orphaned videos (uploaded but never linked to profile/job) | P3 | TODO | Cron job to clean up |

---

## 7. Environment & Secrets

| # | Item | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 7.1 | `.env` and `.env.local` are in `.gitignore` | P0 | DONE | Verified — not tracked by git |
| 7.2 | No secrets committed to git history | P0 | CHECK | Run `git log --all -p -- .env .env.local` to verify |
| 7.3 | Only `NEXT_PUBLIC_*` vars are exposed to the browser | P0 | CHECK | Verify no server-only keys leak to client bundle |
| 7.4 | Rotate all API keys if they were ever committed | P0 | CHECK | Supabase service role key, Cloudflare API token |
| 7.5 | Remove unused/placeholder keys from env files | P3 | TODO | `OPENAI_API_KEY=your_openai_key_` still present |

---

## 8. Deployment & Infrastructure

| # | Item | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 8.1 | Vercel deployment uses HTTPS only | P0 | DONE | Vercel enforces HTTPS by default |
| 8.2 | Set `Strict-Transport-Security` header | P1 | DONE | Added to `next.config.js` headers — 2yr max-age, includeSubDomains, preload |
| 8.3 | Set `X-Content-Type-Options: nosniff` | P1 | DONE | Added to `next.config.js` headers |
| 8.4 | Set `X-Frame-Options: DENY` | P1 | DONE | Added to `next.config.js` headers |
| 8.5 | Set `Content-Security-Policy` header | P2 | DONE | Full CSP with Cloudflare Stream, Supabase, Google OAuth allowed |
| 8.6 | Configure Vercel environment variable scoping (production vs preview) | P2 | TODO | Service role key only in production |
| 8.7 | Enable Vercel deployment protection for preview URLs | P3 | TODO | Prevent unauthorized access to preview deployments |

---

## 9. Rate Limiting & DDoS Protection

| # | Item | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 9.1 | Add rate limiting to `/api/auth/signup` (e.g., 5 req/min per IP) | P0 | DONE | In-memory rate limiter: 5 req/min per IP |
| 9.2 | Add rate limiting to `/api/auth/oauth-profile` | P1 | DONE | 5 req/min per IP |
| 9.3 | Add rate limiting to `/api/upload` | P1 | DONE | 10 req/5min per IP |
| 9.4 | Add rate limiting to login attempts | P1 | TODO | Supabase has some built-in, verify config |
| 9.5 | Enable Vercel Edge Middleware for bot detection | P2 | TODO | |

---

## 10. Data Privacy & Compliance

| # | Item | Priority | Status | Notes |
|---|------|----------|--------|-------|
| 10.1 | Privacy policy page | P1 | TODO | Required for Google OAuth, GDPR, UAE PDPL |
| 10.2 | Terms of service page | P1 | TODO | |
| 10.3 | Cookie consent banner | P1 | TODO | Required for EU users |
| 10.4 | User data deletion endpoint (right to erasure) | P2 | TODO | GDPR/UAE PDPL requirement |
| 10.5 | Data export endpoint (right to portability) | P2 | TODO | |
| 10.6 | Audit log for sensitive operations | P2 | TODO | Track profile changes, job postings, applications |
| 10.7 | Video data retention policy | P3 | TODO | Auto-delete videos after account deletion |

---

## Remediation Priority Order

### Before any real users (P0):
1. Add auth checks to `/api/upload` and `/api/auth/oauth-profile`
2. Verify service role key is not client-accessible
3. Verify RLS is enabled on all tables
4. Add rate limiting to signup endpoint
5. Validate `redirect` param in OAuth callback

### Before public launch (P1):
6. Add security headers (HSTS, X-Frame-Options, etc.)
7. Input validation with Zod schemas on all API routes
8. Enable signed URLs for Cloudflare Stream
9. Fix search query interpolation in helpers.ts
10. Privacy policy and terms of service pages
11. Cookie security flags verification

### First sprint post-launch (P2):
12. Content Security Policy header
13. Account lockout / brute force protection
14. Video content moderation
15. User data deletion / export endpoints
16. Audit logging

---

## Quick Wins (can implement in < 30 min each)

1. **Validate redirect param** — add `if (redirect.startsWith('/'))` check in callback
2. **Auth check on upload** — add `getUser()` call at top of `/api/upload`
3. **Verify userId matches session** — in oauth-profile, compare `userId` with authenticated user
4. **Security headers** — add `headers()` config to `next.config.ts`
5. **Remove placeholder env vars** — clean up unused keys from `.env`
