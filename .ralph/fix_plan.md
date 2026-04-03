# Muqabla MVP — Fix Plan

## Phase 1: Auth Flow (Wire screens to existing hooks)

- [ ] **Wire login screen** — Connect `app/(auth)/login.tsx` to `useAuth().signInWithEmail`. Add form state, validation (email format, password min 6 chars), error display, loading state. Navigate to tabs on success.
- [ ] **Wire register screen** — Connect `app/(auth)/register.tsx` to `useAuth().signUpWithEmail`. Add role selection (candidate/employer), form state, validation, error display. Navigate to onboarding on success.
- [ ] **Wire OTP verification** — Connect `app/(auth)/verify-otp.tsx` to `useAuth().verifyOTP`. Add code input (6 digits), resend timer, error handling.
- [ ] **Build candidate onboarding** — `app/(auth)/onboarding/candidate.tsx`. Multi-step form: name, headline, phone, country/city (from GCC config), experience level. Use `useAuth().completeOnboarding`. Navigate to tabs on complete.
- [ ] **Build employer onboarding** — `app/(auth)/onboarding/employer.tsx`. Multi-step form: company name, industry, size, website, contact person. Navigate to tabs on complete.
- [ ] **Auth-gated navigation** — Update root `_layout.tsx` to check auth state from Zustand store. Redirect to auth if no session, redirect to tabs if logged in. Handle loading state with splash screen.

## Phase 2: Core Feed Experience

- [ ] **Build job feed screen** — Replace placeholder in `app/(tabs)/feed.tsx`. Use `useJobFeed()` hook. Render `JobCard` components in a FlatList with pull-to-refresh and infinite scroll. Show loading skeleton on first load.
- [ ] **Build job detail screen** — `app/job/[id].tsx`. Use `useJob(id)` hook. Show: video player (if job has video), company info, job description, requirements, tags (location, salary, type). "Apply with Video" CTA button at bottom.
- [ ] **Wire search screen** — Connect `app/(tabs)/search.tsx` to `useJobSearch()`. Add filter chips (job type, work mode, experience level from config). Show `JobCardCompact` results. Debounced text search.
- [ ] **Build company profile** — `app/company/[id].tsx`. Show company info, logo, about, open positions list. Use existing Supabase helpers.

## Phase 3: Video Application Flow

- [ ] **Build record screen** — `app/(tabs)/record.tsx`. Integrate `VideoRecorder` component. Add pre-record prompt ("Tell us about yourself in 60 seconds"). After recording, show preview with `VideoPlayer`. Confirm or re-record.
- [ ] **Video upload flow** — After recording confirmation, use `useVideoUpload()` to upload to MUX. Show upload progress bar. On success, save video record to Supabase. Navigate to profile or applications.
- [ ] **Apply to job with video** — From job detail "Apply with Video" button, open record flow. After upload, call `useApplyToJob()` with the video ID. Show success confirmation. Navigate back to feed.

## Phase 4: Profile & Applications

- [ ] **Build profile screen** — `app/(tabs)/profile.tsx`. Show user info, profile video (with VideoPlayer), stats (applications sent, views). Edit profile button. Sign out button using auth store.
- [ ] **Build applications screen** — `app/(tabs)/applications.tsx`. Use `useMyApplications()`. Show list of applied jobs with status badges (pending, viewed, shortlisted, etc). Tap to view job detail.
- [ ] **Saved jobs** — Add save/unsave functionality to JobCard using `useSavedJobs()`. Show saved jobs as a section in profile or a filter in applications tab.

## Phase 5: Polish

- [ ] **Error handling** — Add toast/alert system for API errors across all screens. Network error detection with retry prompts.
- [ ] **Empty states** — Design empty states for: no jobs in feed, no search results, no applications, no saved jobs. Use illustrations or icons with helpful text.
- [ ] **Loading states** — Add skeleton loaders for feed, job detail, profile. Consistent loading spinners for actions.

## Completed
- [x] Project foundation (types, hooks, components, lib)
- [x] Supabase integration (auth, database, storage)
- [x] MUX video integration (upload, playback, thumbnails)
- [x] Design system (colors, Button, Input, JobCard)
- [x] Navigation structure (auth stack, tabs, dynamic routes)
- [x] Ralph enabled and configured

## Notes
- All Supabase helpers are in `lib/supabase.ts` — use them directly
- All hooks are ready — just import and wire to UI
- Colors: primary #0D7377 (teal), accent #C9A227 (gold)
- GCC config data in `constants/config.ts` (countries, cities, categories)
- Video max 60s, 100MB limit per `constants/config.ts`
