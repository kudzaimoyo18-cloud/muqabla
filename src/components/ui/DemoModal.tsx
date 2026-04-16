'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Briefcase,
  Users,
  X,
  Video,
  Zap,
  Target,
  Sparkles,
  PlayCircle,
  CheckCircle2,
} from 'lucide-react';

type DemoTab = 'recruiter' | 'jobSeeker';

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: DemoTab;
}

type TabContent = {
  key: DemoTab;
  label: string;
  icon: React.ReactNode;
  src: string;
  poster: string;
  headline: string;
  subhead: string;
  highlights: { icon: React.ReactNode; title: string; body: string }[];
};

const TABS: TabContent[] = [
  {
    key: 'jobSeeker',
    label: 'For Job Seekers',
    icon: <Users className="w-4 h-4" />,
    // NOTE: src/poster intentionally swapped with the recruiter tab — the
    // raw footage was originally labelled the other way around.
    src: '/demos/recruiter-demo.mp4',
    poster: '/demos/recruiter-poster.jpg',
    headline: 'Your video is your resume.',
    subhead: 'Swipe through jobs, record a 30-second pitch, and get discovered by top employers in the GCC.',
    highlights: [
      {
        icon: <Video className="w-4 h-4" />,
        title: 'One-tap video profile',
        body: 'Replace PDFs with a 30s intro. Show your personality and skills.',
      },
      {
        icon: <Sparkles className="w-4 h-4" />,
        title: 'TikTok-style job feed',
        body: 'Swipe through curated roles tailored to your location and stack.',
      },
      {
        icon: <Zap className="w-4 h-4" />,
        title: 'Apply in seconds',
        body: 'No cover letters. No forms. One tap applies your video.',
      },
    ],
  },
  {
    key: 'recruiter',
    label: 'For Recruiters',
    icon: <Briefcase className="w-4 h-4" />,
    // NOTE: src/poster intentionally swapped with the job-seeker tab — see above.
    src: '/demos/job-seeker-demo.mp4',
    poster: '/demos/job-seeker-poster.jpg',
    headline: 'Hire from video, not paper.',
    subhead: 'Post jobs, browse candidate videos, and shortlist top talent in minutes — not weeks.',
    highlights: [
      {
        icon: <Target className="w-4 h-4" />,
        title: 'See the human, fast',
        body: 'Judge communication and fit before the first call.',
      },
      {
        icon: <PlayCircle className="w-4 h-4" />,
        title: 'Video-first shortlisting',
        body: 'Swipe through candidate pitches. Save the ones you love.',
      },
      {
        icon: <CheckCircle2 className="w-4 h-4" />,
        title: 'Built for the GCC',
        body: 'Localized for UAE, KSA, Qatar, Kuwait, Bahrain, and Oman.',
      },
    ],
  },
];

export default function DemoModal({ open, onClose, initialTab = 'jobSeeker' }: DemoModalProps) {
  const [tab, setTab] = useState<DemoTab>(initialTab);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Reset to the chosen tab each time the modal opens so repeat viewings start fresh.
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  // Close on Escape + prevent background scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // Autoplay from the start whenever the tab changes.
  useEffect(() => {
    if (!open) return;
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {
      /* autoplay may be blocked; user can press play */
    });
  }, [tab, open]);

  if (!open) return null;

  const active = TABS.find((t) => t.key === tab)!;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Muqabla demo video"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close demo"
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Panel */}
      <div
        className="
          relative z-10 w-full
          max-w-md sm:max-w-lg
          md:max-w-3xl lg:max-w-5xl xl:max-w-6xl
          md:max-h-[92vh]
          bg-[#0a0a0a] border border-white/[0.08]
          rounded-3xl shadow-2xl shadow-black/60
          overflow-hidden
          flex flex-col
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-white">Watch Demo</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 md:px-8 pt-4">
          <div className="flex gap-1 p-1.5 bg-white/[0.04] border border-white/[0.06] rounded-xl md:max-w-md md:mx-auto">
            {TABS.map((t) => {
              const isActive = t.key === tab;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.25)]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body: stacks on mobile, side-by-side on desktop */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-stretch md:gap-8 lg:gap-12 p-5 md:p-8">
            {/* Context panel (desktop: left; hidden on mobile where video leads) */}
            <div className="hidden md:flex md:flex-1 md:flex-col md:justify-center md:max-w-md lg:max-w-lg">
              <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-emerald-400 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                {tab === 'jobSeeker' ? 'For Candidates' : 'For Employers'}
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                {active.headline}
              </h2>
              <p className="text-base text-gray-400 leading-relaxed mb-8">
                {active.subhead}
              </p>

              <ul className="space-y-5">
                {active.highlights.map((h) => (
                  <li key={h.title} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      {h.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{h.title}</div>
                      <div className="text-sm text-gray-400 mt-0.5 leading-relaxed">{h.body}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Video column */}
            <div className="md:flex-shrink-0 mx-auto md:mx-0">
              {/*
                Sizing strategy:
                 - Mobile: width-driven. max-w caps the portrait player at ~360-400px
                   so it isn't uncomfortably large on phones/tablets.
                 - Desktop (md+): height-driven. The player fills the available vertical
                   space up to min(72vh, 720px), and width is derived from the 9:16 ratio.
                   That produces ~365-405px × 648-720px on typical laptops instead of the
                   previous 340×604 — noticeably bigger and better-balanced against the
                   text column.
              */}
              <div
                className="
                  relative aspect-[9/16] rounded-2xl overflow-hidden
                  bg-black border border-white/[0.06]
                  md:shadow-2xl md:shadow-black/50 md:ring-1 md:ring-white/[0.06]
                  w-full max-w-[360px] sm:max-w-[400px]
                  md:max-w-none md:w-auto md:h-[min(72vh,720px)]
                "
              >
                <video
                  key={active.key} // force remount so poster swaps cleanly between tabs
                  ref={videoRef}
                  src={active.src}
                  poster={active.poster}
                  controls
                  autoPlay
                  playsInline
                  muted
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Mobile-only tagline below video */}
              <div className="md:hidden mt-4">
                <h2 className="text-lg font-bold text-white leading-snug">
                  {active.headline}
                </h2>
                <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                  {active.subhead}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
