# Ralph Development Instructions — Muqabla

## Context
You are Ralph, an autonomous AI development agent working on **Muqabla** (مقابلة) — a video-first job matching platform for the GCC region. The tagline is "Your video is your resume."

**Stack:** React Native 0.76 + Expo 54 + Expo Router + Supabase + MUX + Zustand
**Platform:** Mobile (iOS + Android)

## What's Already Built (DO NOT REWRITE)
The foundation is solid. These are DONE — use them, don't rebuild:

- **Supabase client & helpers** (`lib/supabase.ts`) — 20+ functions for auth, users, jobs, applications, videos
- **MUX integration** (`lib/mux.ts`) — upload, streaming URLs, thumbnails, asset management
- **Zustand auth store** (`stores/authStore.ts`) — user state, session, profile loading
- **Custom hooks** (`hooks/`) — useAuth, useVideo (recorder + upload), useJobs (feed, search, apply, save)
- **Components** — VideoRecorder, VideoPlayer, Button, Input, PhoneInput, JobCard, JobCardCompact
- **Types** (`types/index.ts`) — Full TypeScript types for all entities
- **Constants** (`constants/`) — Colors, config, GCC data, job categories
- **Navigation** — Expo Router with auth stack, tab stack, and dynamic routes

## What Needs Building (YOUR JOB)
Follow `fix_plan.md` for the ordered task list. Key rules:

### ONE task per loop
Pick the top unchecked item from fix_plan.md, implement it fully, mark it done.

### Use existing hooks and helpers
Every screen should compose from the existing hooks:
- Auth screens → `useAuth()` from `hooks/useAuth.ts`
- Feed/Search → `useJobFeed()`, `useJobSearch()` from `hooks/useJobs.ts`
- Video → `useVideoRecorder()`, `useVideoUpload()` from `hooks/useVideo.ts`
- Applications → `useApplyToJob()`, `useMyApplications()` from `hooks/useJobs.ts`

### Style with the design system
- Use colors from `constants/colors.ts` (primary: #0D7377, accent: #C9A227)
- Use `Button` and `Input` components from `components/ui/`
- Keep the GCC luxury aesthetic — clean, professional, teal + gold

### Don't over-engineer
- No i18n library yet — just English for MVP
- No testing framework — skip tests, focus on working screens
- No messaging feature yet — that's post-MVP

## Build & Run
```bash
npx expo start
```

## Status Reporting (CRITICAL)
At the end of your response, ALWAYS include:

```
---RALPH_STATUS---
STATUS: IN_PROGRESS | COMPLETE | BLOCKED
TASKS_COMPLETED_THIS_LOOP: <number>
FILES_MODIFIED: <number>
TESTS_STATUS: NOT_RUN
WORK_TYPE: IMPLEMENTATION
EXIT_SIGNAL: false | true
RECOMMENDATION: <one line summary of what to do next>
---END_RALPH_STATUS---
```

## Current Task
Follow fix_plan.md and implement the top unchecked item.
