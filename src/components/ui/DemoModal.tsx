'use client';

import { useEffect, useRef, useState } from 'react';
import { Briefcase, Users, X } from 'lucide-react';

type DemoTab = 'recruiter' | 'jobSeeker';

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: DemoTab;
}

const TABS: { key: DemoTab; label: string; icon: React.ReactNode; src: string; poster: string }[] = [
  {
    key: 'jobSeeker',
    label: 'For Job Seekers',
    icon: <Users className="w-4 h-4" />,
    src: '/demos/job-seeker-demo.mp4',
    poster: '/demos/job-seeker-poster.jpg',
  },
  {
    key: 'recruiter',
    label: 'For Recruiters',
    icon: <Briefcase className="w-4 h-4" />,
    src: '/demos/recruiter-demo.mp4',
    poster: '/demos/recruiter-poster.jpg',
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
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
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
      <div className="relative z-10 w-full max-w-md sm:max-w-lg bg-[#0a0a0a] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
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
        <div className="flex gap-1 p-1.5 mx-5 mt-4 bg-white/[0.04] border border-white/[0.06] rounded-xl">
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

        {/* Video */}
        <div className="p-5">
          <div className="relative rounded-2xl overflow-hidden bg-black border border-white/[0.06]">
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
              className="w-full aspect-[9/16] object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
