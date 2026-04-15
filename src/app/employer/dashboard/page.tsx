'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase, Users, Eye, TrendingUp, Plus, ChevronRight, Loader2,
  Clock, CheckCircle, UserCheck, Pause, Play, XCircle, MapPin,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase/client';
import { getEmployerProfile } from '@/lib/supabase/helpers';
import BottomNav from '@/components/layout/BottomNav';
import Avatar from '@/components/ui/Avatar';

interface DashboardStats {
  activeJobs: number;
  totalApplicants: number;
  newToday: number;
  totalViews: number;
}

interface PostedJob {
  id: string;
  title: string;
  status: string;
  city: string;
  country: string;
  job_type: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  applications_count: number;
  created_at: string;
}

interface RecentApplicant {
  id: string;
  candidate_id: string;
  status: string;
  created_at: string;
  job: { title: string } | null;
  candidate: { headline?: string; city?: string } | null;
  user: { full_name: string; avatar_url?: string } | null;
}

export default function EmployerDashboardPage() {
  const router = useRouter();
  const { user, profile, initialize } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({ activeJobs: 0, totalApplicants: 0, newToday: 0, totalViews: 0 });
  const [postedJobs, setPostedJobs] = useState<PostedJob[]>([]);
  const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    if (!user?.id) return;

    async function loadDashboard() {
      setLoading(true);

      // Get employer + company
      const { data: employer } = await getEmployerProfile(user!.id);
      const companyId = employer?.company_id;
      if (employer?.company) {
        setCompanyName((employer.company as { name: string }).name);
      }

      if (!companyId) { setLoading(false); return; }

      // Get stats
      const { count: activeJobCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active');

      const { data: companyJobs } = await supabase
        .from('jobs')
        .select('id, title, status, city, country, job_type, salary_min, salary_max, salary_currency, applications_count, created_at')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      setPostedJobs((companyJobs as PostedJob[]) || []);
      const jobIds = companyJobs?.map((j) => j.id) || [];

      let totalApplicants = 0;
      let newToday = 0;

      if (jobIds.length > 0) {
        const { count: appCount } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .in('job_id', jobIds);

        totalApplicants = appCount || 0;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { count: todayCount } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .in('job_id', jobIds)
          .gte('created_at', todayStart.toISOString());

        newToday = todayCount || 0;

        // Recent applicants
        const { data: recent } = await supabase
          .from('applications')
          .select('id, candidate_id, status, created_at, job:jobs(title)')
          .in('job_id', jobIds)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recent) {
          const enriched = await Promise.all(
            recent.map(async (app) => {
              const { data: candidateData } = await supabase
                .from('candidates')
                .select('headline, city')
                .eq('id', app.candidate_id)
                .single();
              const { data: userData } = await supabase
                .from('users')
                .select('full_name, avatar_url')
                .eq('id', app.candidate_id)
                .single();
              return { ...app, candidate: candidateData, user: userData } as unknown as RecentApplicant;
            })
          );
          setRecentApplicants(enriched);
        }
      }

      setStats({
        activeJobs: activeJobCount || 0,
        totalApplicants,
        newToday,
        totalViews: 0,
      });

      setLoading(false);
    }

    loadDashboard();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    viewed: 'text-blue-400 bg-blue-400/10',
    shortlisted: 'text-emerald-400 bg-emerald-400/10',
    rejected: 'text-red-400 bg-red-400/10',
    hired: 'text-green-400 bg-green-400/10',
  };

  const JOB_STATUS_COLORS: Record<string, string> = {
    active: 'text-emerald-400 bg-emerald-400/10',
    paused: 'text-yellow-400 bg-yellow-400/10',
    closed: 'text-gray-400 bg-gray-400/10',
    draft: 'text-blue-400 bg-blue-400/10',
  };

  const JOB_TYPE_LABELS: Record<string, string> = {
    full_time: 'Full Time', part_time: 'Part Time', contract: 'Contract',
    freelance: 'Freelance', internship: 'Internship',
  };

  const formatSalary = (min?: number, max?: number, currency = 'AED') => {
    const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toString();
    if (min && max) return `${currency} ${fmt(min)} - ${fmt(max)}`;
    if (min) return `${currency} ${fmt(min)}+`;
    if (max) return `Up to ${currency} ${fmt(max)}`;
    return null;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1d ago';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    setUpdatingJobId(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setPostedJobs((prev) =>
          prev.map((j) => j.id === jobId ? { ...j, status: newStatus } : j)
        );
        if (newStatus === 'active') setStats((s) => ({ ...s, activeJobs: s.activeJobs + 1 }));
        else setStats((s) => ({ ...s, activeJobs: Math.max(0, s.activeJobs - 1) }));
      }
    } catch { /* ignore */ } finally {
      setUpdatingJobId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <p className="text-sm text-gray-500">Welcome back</p>
        <h1 className="text-xl font-bold text-white">{companyName || profile?.full_name || 'Dashboard'}</h1>
      </div>

      <div className="px-4 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Active Jobs', value: stats.activeJobs, icon: Briefcase, color: 'text-emerald-400 bg-emerald-400/10' },
            { label: 'Total Applicants', value: stats.totalApplicants, icon: Users, color: 'text-blue-400 bg-blue-400/10' },
            { label: 'New Today', value: stats.newToday, icon: TrendingUp, color: 'text-orange-400 bg-orange-400/10' },
            { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'text-purple-400 bg-purple-400/10' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#111] border border-white/[0.06] rounded-xl p-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/employer/post-job')}
            className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl p-4 transition-colors"
          >
            <Plus className="w-5 h-5 text-white" />
            <span className="text-sm font-medium text-white">Post a Job</span>
          </button>
          <button
            onClick={() => router.push('/employer/candidates')}
            className="flex items-center gap-3 bg-[#111] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-4 transition-colors"
          >
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-white">Candidates</span>
          </button>
        </div>

        {/* My Posted Jobs */}
        <div className="bg-[#111] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <h3 className="text-sm font-medium text-white">
              My Posted Jobs {postedJobs.length > 0 && <span className="text-gray-500">({postedJobs.length})</span>}
            </h3>
          </div>

          {postedJobs.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Briefcase className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-xs text-gray-600 mb-3">You haven&apos;t posted any jobs yet</p>
              <button
                onClick={() => router.push('/employer/post-job')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {postedJobs.map((job) => {
                const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
                return (
                  <div key={job.id} className="px-4 py-4">
                    {/* Row 1: Title + Status */}
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-white leading-tight flex-1 min-w-0 mr-3">{job.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize shrink-0 ${JOB_STATUS_COLORS[job.status] || 'text-gray-400 bg-gray-400/10'}`}>
                        {job.status}
                      </span>
                    </div>

                    {/* Row 2: Meta info */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.city}{job.country ? `, ${job.country}` : ''}
                      </span>
                      <span>{JOB_TYPE_LABELS[job.job_type] || job.job_type}</span>
                      {salary && <span>{salary}</span>}
                      <span>{job.applications_count || 0} applicant{job.applications_count === 1 ? '' : 's'}</span>
                      <span>Posted {timeAgo(job.created_at)}</span>
                    </div>

                    {/* Row 3: Actions */}
                    <div className="flex items-center gap-2">
                      {job.status === 'active' ? (
                        <button
                          onClick={() => updateJobStatus(job.id, 'paused')}
                          disabled={updatingJobId === job.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-400/10 hover:bg-yellow-400/20 rounded-md text-[11px] font-medium text-yellow-400 transition-colors disabled:opacity-50"
                        >
                          <Pause className="w-3 h-3" /> Pause
                        </button>
                      ) : job.status === 'paused' ? (
                        <button
                          onClick={() => updateJobStatus(job.id, 'active')}
                          disabled={updatingJobId === job.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-400/10 hover:bg-emerald-400/20 rounded-md text-[11px] font-medium text-emerald-400 transition-colors disabled:opacity-50"
                        >
                          <Play className="w-3 h-3" /> Activate
                        </button>
                      ) : null}
                      {job.status !== 'closed' && (
                        <button
                          onClick={() => updateJobStatus(job.id, 'closed')}
                          disabled={updatingJobId === job.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-400/10 hover:bg-gray-400/20 rounded-md text-[11px] font-medium text-gray-400 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" /> Close
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/employer/candidates?job=${job.id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0a0a0a] border border-white/[0.06] hover:border-white/[0.12] rounded-md text-[11px] font-medium text-white transition-colors ml-auto"
                      >
                        View Applicants <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Applicants */}
        <div className="bg-[#111] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <h3 className="text-sm font-medium text-white">Recent Applicants</h3>
            <button onClick={() => router.push('/employer/candidates')} className="text-xs text-emerald-400 hover:text-emerald-300">
              View All
            </button>
          </div>

          {recentApplicants.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Users className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-xs text-gray-600">No applicants yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {recentApplicants.map((app) => (
                <div key={app.id} className="px-4 py-3 flex items-center gap-3">
                  <Avatar src={app.user?.avatar_url} name={app.user?.full_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{app.user?.full_name || 'Candidate'}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {app.candidate?.headline || app.candidate?.city || 'Applied'} &middot; {(app.job as { title: string } | null)?.title || 'Job'}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${STATUS_COLORS[app.status] || 'text-gray-400 bg-gray-400/10'}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
