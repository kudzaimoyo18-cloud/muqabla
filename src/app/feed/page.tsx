'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin, DollarSign, Briefcase,
  Bookmark, BookmarkCheck, Send, Check, Building2, Loader2, Volume2, VolumeX,
} from 'lucide-react';
import { useFeedStore } from '@/stores/feed-store';
import { useAuthStore } from '@/stores/auth-store';
import { useSwipe } from '@/hooks/useSwipe';
import BottomNav from '@/components/layout/BottomNav';
import { getVideoUrl, isR2Video } from '@/lib/cloudflare';

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full Time', part_time: 'Part Time', contract: 'Contract',
  freelance: 'Freelance', internship: 'Internship',
};

const WORK_MODE_LABELS: Record<string, string> = {
  on_site: 'On-site', remote: 'Remote', hybrid: 'Hybrid',
};

const SENIORITY_LABELS: Record<string, string> = {
  entry: 'Entry Level', junior: 'Junior', mid: 'Mid Level',
  senior: 'Senior', lead: 'Lead', executive: 'Executive',
};

function formatSalary(min?: number, max?: number, currency = 'AED') {
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toString();
  if (min && max) return `${currency} ${fmt(min)} - ${fmt(max)}`;
  if (min) return `${currency} ${fmt(min)}+`;
  if (max) return `Up to ${currency} ${fmt(max)}`;
  return 'Competitive';
}

export default function FeedPage() {
  const router = useRouter();
  const { jobs, currentIndex, isLoading, fetchJobs, setCurrentIndex, applyToJob, saveJob, savedJobs, appliedJobs } = useFeedStore();
  const { user, profile, initialize } = useAuthStore();
  const [actionFeedback, setActionFeedback] = useState<{ type: 'applied' | 'saved' | null; index: number }>({ type: null, index: -1 });
  const [muted, setMuted] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => { fetchJobs(true); }, [fetchJobs]);

  // IntersectionObserver to track which card is visible
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || jobs.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            if (!isNaN(index)) setCurrentIndex(index);
          }
        });
      },
      { root: container, threshold: 0.5 }
    );

    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [jobs.length, setCurrentIndex]);

  // Prefetch more jobs when nearing the end
  useEffect(() => {
    if (currentIndex >= jobs.length - 3 && jobs.length > 0) fetchJobs();
  }, [currentIndex, jobs.length, fetchJobs]);

  const currentJob = jobs[currentIndex];

  const handleApply = useCallback(async () => {
    if (!currentJob || !profile?.id || appliedJobs.has(currentJob.id)) return;
    const success = await applyToJob(currentJob.id, profile.id);
    if (success) {
      setActionFeedback({ type: 'applied', index: currentIndex });
      setTimeout(() => {
        setActionFeedback({ type: null, index: -1 });
        // Auto-scroll to next after apply
        const next = currentIndex + 1;
        if (next < jobs.length) {
          const el = cardRefs.current.get(next);
          el?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 800);
    }
  }, [currentJob, profile, appliedJobs, applyToJob, currentIndex, jobs.length]);

  const handleSave = useCallback(async () => {
    if (!currentJob || !profile?.id || savedJobs.has(currentJob.id)) return;
    const success = await saveJob(currentJob.id, profile.id);
    if (success) {
      setActionFeedback({ type: 'saved', index: currentIndex });
      setTimeout(() => setActionFeedback({ type: null, index: -1 }), 1200);
    }
  }, [currentJob, profile, savedJobs, saveJob, currentIndex]);

  // Horizontal-only swipe for apply/save
  const { swipeState, handlers } = useSwipe({
    onSwipeLeft: handleApply,
    onSwipeRight: handleSave,
    threshold: 60,
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        const next = currentIndex + 1;
        if (next < jobs.length) cardRefs.current.get(next)?.scrollIntoView({ behavior: 'smooth' });
      }
      if (e.key === 'ArrowUp' || e.key === 'k') {
        const prev = currentIndex - 1;
        if (prev >= 0) cardRefs.current.get(prev)?.scrollIntoView({ behavior: 'smooth' });
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') handleApply();
      if (e.key === 'ArrowRight' || e.key === 's') handleSave();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, jobs.length, handleApply, handleSave]);

  if (isLoading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="text-center">
          <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No jobs yet</h2>
          <p className="text-gray-400 text-sm">Check back soon for new opportunities</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const cardHeight = 'h-[calc(100vh-72px)]';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div
        ref={scrollRef}
        className={`${cardHeight} feed-container`}
        {...handlers}
      >
        {jobs.map((job, index) => {
          const isNear = Math.abs(index - currentIndex) <= 1;
          const isCurrent = index === currentIndex;
          const isApplied = appliedJobs.has(job.id);
          const isSaved = savedJobs.has(job.id);

          return (
            <div
              key={job.id}
              ref={(el) => { if (el) cardRefs.current.set(index, el); else cardRefs.current.delete(index); }}
              data-index={index}
              className={`${cardHeight} feed-card relative flex flex-col md:flex-row-reverse md:items-center md:justify-center md:gap-10 lg:gap-14 md:px-6 lg:px-10`}
              style={{
                transform: isCurrent && swipeState.isSwiping && swipeState.direction !== 'up' && swipeState.direction !== 'down'
                  ? `translateX(${swipeState.deltaX * 0.3}px)` : undefined,
                transition: isCurrent && swipeState.isSwiping ? 'none' : 'transform 0.3s ease-out',
              }}
            >
              {/* Video Column */}
              <div className="flex-1 md:flex-none md:w-[420px] lg:w-[460px] md:h-[calc(100vh-140px)] md:max-h-[820px] md:rounded-2xl md:shadow-2xl md:shadow-black/50 md:ring-1 md:ring-white/[0.06] relative bg-gradient-to-b from-gray-900 to-[#0a0a0a] overflow-hidden">
                {isNear && job.cloudflare_uid ? (
                  <div className="absolute inset-0">
                    {isR2Video(job.cloudflare_uid) ? (
                      <video
                        src={getVideoUrl(job.cloudflare_uid)}
                        className="w-full h-full object-cover md:object-contain"
                        autoPlay={isCurrent}
                        loop
                        muted={muted}
                        playsInline
                      />
                    ) : (
                      <iframe
                        src={`${getVideoUrl(job.cloudflare_uid)}?muted=${muted}&autoplay=${isCurrent}&loop=true`}
                        className="w-full h-full"
                        allow="autoplay; fullscreen"
                        allowFullScreen
                      />
                    )}
                    <div className="video-overlay absolute inset-0 pointer-events-none" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-emerald-400/50" />
                    </div>
                  </div>
                )}

                {/* Top bar */}
                {isCurrent && (
                  <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
                    <div className="text-sm text-gray-300 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full md:hidden">
                      {index + 1} / {jobs.length}
                    </div>
                    <span className="md:hidden" />
                    <button onClick={() => setMuted(!muted)} className="w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center ml-auto">
                      {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                )}

                {/* Mobile side actions */}
                <div className="absolute right-4 bottom-8 flex flex-col gap-4 z-10 md:hidden">
                  <button onClick={handleSave} className="w-12 h-12 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                    {isSaved ? <BookmarkCheck className="w-5 h-5 text-emerald-400" /> : <Bookmark className="w-5 h-5 text-white" />}
                  </button>
                  <button onClick={handleApply} disabled={isApplied} className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 rounded-full flex items-center justify-center transition-colors">
                    {isApplied ? <Check className="w-5 h-5 text-white" /> : <Send className="w-5 h-5 text-white" />}
                  </button>
                </div>
              </div>

              {/* Desktop Left Panel (Details) */}
              <div className="hidden md:flex md:flex-col md:flex-1 md:max-w-lg lg:max-w-xl md:h-[calc(100vh-140px)] md:max-h-[820px] md:overflow-y-auto md:py-2 md:pr-2 feed-details-panel">
                {/* Counter */}
                <div className="text-xs text-gray-500 mb-4 tracking-wide uppercase">
                  Job {index + 1} of {jobs.length}
                </div>

                {/* Header */}
                <div className="mb-5">
                  <div className="flex items-center gap-2.5 text-gray-400 mb-3">
                    {job.company_logo ? (
                      <img src={job.company_logo} alt="" className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/[0.06]" />
                    ) : (
                      <div className="w-8 h-8 bg-[#111] rounded-lg flex items-center justify-center ring-1 ring-white/[0.06]">
                        <Building2 className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-300">{job.company_name}</span>
                  </div>
                  <h2 className="text-[28px] lg:text-3xl font-bold text-white leading-[1.15] tracking-tight">{job.title}</h2>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111] border border-white/[0.06] rounded-lg text-xs text-gray-300">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    {job.city}{job.country ? `, ${job.country}` : ''}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111] border border-white/[0.06] rounded-lg text-xs text-gray-300">
                    <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                    {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111] border border-white/[0.06] rounded-lg text-xs text-gray-300">
                    <Briefcase className="w-3.5 h-3.5 text-gray-500" />
                    {JOB_TYPE_LABELS[job.job_type] || job.job_type}
                  </span>
                  {job.work_mode && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-[#111] border border-white/[0.06] rounded-lg text-xs text-gray-300">
                      {WORK_MODE_LABELS[job.work_mode] || job.work_mode}
                    </span>
                  )}
                  {job.seniority && (
                    <span className="inline-flex items-center px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 font-medium">
                      {SENIORITY_LABELS[job.seniority] || job.seniority}
                    </span>
                  )}
                </div>

                {/* Description */}
                {job.description && (
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">About this role</h3>
                    <p className="text-[15px] text-gray-300 leading-relaxed whitespace-pre-line">{job.description}</p>
                  </div>
                )}

                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Requirements</h3>
                    <ul className="space-y-2">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[15px] text-gray-300 leading-relaxed">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Desktop Action Buttons */}
                <div className="mt-auto sticky bottom-0 flex gap-3 pt-5 pb-2 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent">
                  <button
                    onClick={handleApply}
                    disabled={isApplied}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/30 disabled:text-white/50 rounded-xl text-sm font-semibold text-white transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    {isApplied ? <><Check className="w-4 h-4" /> Applied</> : <><Send className="w-4 h-4" /> Apply Now</>}
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#111] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02] rounded-xl text-sm font-medium text-white transition-colors"
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4 text-emerald-400" /> : <Bookmark className="w-4 h-4" />}
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Mobile Job Info Bar */}
              <div className="md:hidden px-5 py-5 bg-[#0a0a0a] border-t border-white/[0.06]">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-white truncate">{job.title}</h2>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{job.company_name}</span>
                      </div>
                    </div>
                    {job.company_logo && (
                      <img src={job.company_logo} alt="" className="w-10 h-10 rounded-lg object-cover ml-3" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#111] border border-white/[0.06] rounded-md text-xs text-gray-300">
                      <MapPin className="w-3 h-3" />
                      {job.city}{job.country ? `, ${job.country}` : ''}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#111] border border-white/[0.06] rounded-md text-xs text-gray-300">
                      <DollarSign className="w-3 h-3" />
                      {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#111] border border-white/[0.06] rounded-md text-xs text-gray-300">
                      <Briefcase className="w-3 h-3" />
                      {JOB_TYPE_LABELS[job.job_type] || job.job_type}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm line-clamp-2">{job.description}</p>
                </div>
              </div>

              {/* Action Feedback Overlay */}
              {actionFeedback.type && actionFeedback.index === index && (
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                  <div className={`px-8 py-4 rounded-2xl backdrop-blur-md animate-fadeIn ${
                    actionFeedback.type === 'applied' ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-blue-500/20 border border-blue-500/30'
                  }`}>
                    <div className="flex items-center gap-3">
                      {actionFeedback.type === 'applied' ? (
                        <><Check className="w-6 h-6 text-emerald-400" /><span className="text-lg font-semibold text-emerald-400">Applied!</span></>
                      ) : (
                        <><BookmarkCheck className="w-6 h-6 text-blue-400" /><span className="text-lg font-semibold text-blue-400">Saved!</span></>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Swipe Direction Overlay */}
              {isCurrent && swipeState.isSwiping && Math.abs(swipeState.deltaX) > 30 && (
                <div className={`absolute inset-0 pointer-events-none z-10 transition-opacity ${
                  swipeState.deltaX < -30 ? 'swipe-overlay-left' : 'swipe-overlay-right'
                }`} />
              )}
            </div>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );
}
