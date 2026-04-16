'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Video, Camera, MapPin, Briefcase, Award, Edit3, Check, X, Plus,
  Loader2, ChevronRight, LogOut, Building2, Mail, Globe, Users, Calendar,
  FileText, Image, Share2, Link as LinkIcon, Shield,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import {
  getCandidateProfile, updateCandidateProfile, updateUserProfile,
  getEmployerProfile,
} from '@/lib/supabase/helpers';
import { getVideoUrl, isR2Video } from '@/lib/cloudflare';
import { cities, countries, industries, companySizes } from '@/constants';
import BottomNav from '@/components/layout/BottomNav';
import Avatar from '@/components/ui/Avatar';

// ======================== CANDIDATE PROFILE ========================

interface CandidateData {
  id: string;
  headline?: string;
  current_title?: string;
  current_company?: string;
  city?: string;
  country?: string;
  years_experience?: number;
  ai_extracted_skills?: string[];
  profile_video_id?: string;
  linkedin_url?: string;
  linkedin_verified?: boolean;
  profile_video?: { cloudflare_uid?: string } | null;
}

// ======================== PROFILE COMPLETENESS ========================

function getProfileCompleteness(candidate: CandidateData | null, profile: any): { score: number; missing: string[] } {
  if (!candidate) return { score: 0, missing: ['Everything'] };
  const checks: [boolean, string][] = [
    [!!profile?.full_name, 'Full name'],
    [!!candidate.headline, 'Headline'],
    [!!candidate.current_title, 'Job title'],
    [!!candidate.current_company, 'Company'],
    [!!candidate.city, 'City'],
    [(candidate.years_experience ?? 0) > 0, 'Experience'],
    [(candidate.ai_extracted_skills?.length ?? 0) > 0, 'Skills'],
    [!!candidate.profile_video_id, 'Profile video'],
    [!!candidate.linkedin_url || !!candidate.linkedin_verified, 'LinkedIn'],
  ];
  const completed = checks.filter(([done]) => done).length;
  const missing = checks.filter(([done]) => !done).map(([, label]) => label);
  return { score: Math.round((completed / checks.length) * 100), missing };
}

function ProfileCompletenessBar({ score, missing }: { score: number; missing: string[] }) {
  const color = score >= 80 ? 'emerald' : score >= 50 ? 'yellow' : 'red';
  const colorMap = {
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/20', bgLight: 'bg-emerald-500/10' },
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/20', bgLight: 'bg-yellow-500/10' },
    red: { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/20', bgLight: 'bg-red-500/10' },
  };
  const c = colorMap[color];

  return (
    <div className={`${c.bgLight} border ${c.border} rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white">Profile Strength</span>
        <span className={`text-sm font-bold ${c.text}`}>{score}%</span>
      </div>
      <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div className={`h-full ${c.bg} rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
      {missing.length > 0 && score < 100 && (
        <p className="text-xs text-gray-500 mt-2">
          Add {missing.slice(0, 3).join(', ')}{missing.length > 3 ? ` +${missing.length - 3} more` : ''} to boost your profile
        </p>
      )}
    </div>
  );
}

function CandidateProfile({ user, profile, isSetup }: { user: any; profile: any; isSetup: boolean }) {
  const router = useRouter();
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(isSetup);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [referralEmail, setReferralEmail] = useState('');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState({ total: 0, signed_up: 0, applied: 0, hired: 0 });
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const [form, setForm] = useState({
    headline: '', current_title: '', current_company: '',
    city: '', country: 'UAE', years_experience: 0, linkedin_url: '', full_name: '',
  });

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await getCandidateProfile(user.id);
    if (data) {
      setCandidate(data as CandidateData);
      setForm({
        headline: data.headline || '', current_title: data.current_title || '',
        current_company: data.current_company || '', city: data.city || '',
        country: data.country || 'UAE', years_experience: data.years_experience || 0,
        linkedin_url: data.linkedin_url || '', full_name: profile?.full_name || '',
      });
      setSkills(data.ai_extracted_skills || []);
    }
    setLoading(false);
  }, [user?.id, profile?.full_name]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    if (form.full_name && form.full_name !== profile?.full_name) {
      await updateUserProfile(user.id, { full_name: form.full_name });
    }
    await updateCandidateProfile(user.id, {
      headline: form.headline, current_title: form.current_title,
      current_company: form.current_company, city: form.city, country: form.country,
      years_experience: form.years_experience, linkedin_url: form.linkedin_url,
      ai_extracted_skills: skills,
    });
    await loadProfile();
    setEditing(false);
    setSaving(false);
    if (isSetup) router.push('/feed');
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setUploading(true);
    try {
      // 1. Request upload token
      const tokenRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'video/mp4',
          type: 'profile',
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || tokenData.error) {
        throw new Error(tokenData.error || 'Failed to get upload token');
      }
      const { workerUrl, uploadToken, videoId } = tokenData;

      // 2. PUT file directly to Cloudflare Worker
      const putRes = await fetch(workerUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'video/mp4',
          'X-Upload-Token': uploadToken,
        },
        body: file,
      });
      if (!putRes.ok) {
        const errText = await putRes.text().catch(() => '');
        throw new Error(`Upload failed (${putRes.status}): ${errText || 'no response body'}`);
      }

      // 3. Confirm upload
      const confirmRes = await fetch('/api/upload/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      });
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok || confirmData.error) {
        throw new Error(confirmData.error || 'Failed to confirm upload');
      }

      await updateCandidateProfile(user.id, { profile_video_id: videoId });
      await loadProfile();
    } catch (err: any) {
      console.error('Profile video upload failed:', err?.message || err);
      alert(`Upload failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const addSkill = () => {
    const skill = newSkill.trim();
    if (skill && !skills.includes(skill)) { setSkills([...skills, skill]); setNewSkill(''); }
  };

  const loadReferrals = useCallback(async () => {
    try {
      const res = await fetch('/api/referrals');
      if (res.ok) {
        const data = await res.json();
        setReferrals(data.referrals || []);
        setReferralStats(data.stats || { total: 0, signed_up: 0, applied: 0, hired: 0 });
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadReferrals(); }, [loadReferrals]);

  const handleReferral = async () => {
    if (!referralEmail.trim()) return;
    setReferralLoading(true);
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referredEmail: referralEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReferralLink(data.referralLink);
      setReferralEmail('');
      await loadReferrals();
    } catch (err: any) {
      alert(err.message || 'Failed to create referral');
    } finally {
      setReferralLoading(false);
    }
  };

  const copyReferralLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch { /* silent */ }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>;
  }

  return (
    <>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">{isSetup ? 'Set Up Your Profile' : 'Profile'}</h1>
        <div className="flex items-center gap-2">
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111] border border-white/[0.06] rounded-lg text-sm text-gray-300 hover:text-white transition-colors">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {!isSetup && (
                <button onClick={() => { setEditing(false); loadProfile(); }} className="w-8 h-8 rounded-lg bg-[#111] border border-white/[0.06] flex items-center justify-center text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-lg text-sm text-white font-medium transition-colors">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {isSetup ? 'Save & Continue' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-4">
        {/* Video */}
        <div className="bg-[#111] border border-white/[0.06] rounded-xl overflow-hidden">
          {candidate?.profile_video?.cloudflare_uid ? (
            <div className="aspect-[9/16] max-h-[300px] relative">
              {isR2Video(candidate.profile_video.cloudflare_uid) ? (
                <video src={getVideoUrl(candidate.profile_video.cloudflare_uid)} className="w-full h-full object-cover" muted playsInline />
              ) : (
                <iframe src={`${getVideoUrl(candidate.profile_video.cloudflare_uid)}?muted=true&autoplay=false`} className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen />
              )}
              {editing && (
                <label className="absolute bottom-3 right-3 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors">
                  <Camera className="w-5 h-5 text-white" />
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                </label>
              )}
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center py-12 ${editing ? 'cursor-pointer hover:bg-white/[0.02]' : ''} transition-colors`}>
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                {uploading ? <Loader2 className="w-7 h-7 animate-spin text-emerald-400" /> : <Video className="w-7 h-7 text-emerald-400" />}
              </div>
              <p className="text-sm font-medium text-white mb-1">{uploading ? 'Uploading...' : 'Add your video intro'}</p>
              <p className="text-xs text-gray-500">60 seconds to make an impression</p>
              {editing && !uploading && <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />}
            </label>
          )}
        </div>

        {/* Basic Info */}
        <div className="bg-[#111] border border-white/[0.06] rounded-xl p-4 space-y-4">
          {editing ? (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Full Name</label>
                <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Headline</label>
                <input type="text" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="e.g. Senior React Developer" className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-emerald-500/50 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Current Title</label>
                  <input type="text" value={form.current_title} onChange={(e) => setForm({ ...form, current_title: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Current Company</label>
                  <input type="text" value={form.current_company} onChange={(e) => setForm({ ...form, current_company: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">City</label>
                  <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none">
                    <option value="">Select city</option>
                    {cities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Country</label>
                  <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none">
                    {countries.map((c) => <option key={c.code} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Years of Experience</label>
                <input type="number" min={0} max={50} value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: parseInt(e.target.value) || 0 })} className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">LinkedIn URL</label>
                <input type="url" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-emerald-500/50 focus:outline-none" />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <Avatar
                  src={profile?.avatar_url}
                  name={profile?.full_name}
                  size="xl"
                  ring={candidate?.linkedin_verified ? 'blue' : 'none'}
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white">{profile?.full_name || 'Your Name'}</h2>
                  {candidate?.headline && <p className="text-sm text-emerald-400 mt-0.5">{candidate.headline}</p>}
                </div>
              </div>
              {(candidate?.current_title || candidate?.current_company) && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Briefcase className="w-3.5 h-3.5 shrink-0" />
                  <span>{candidate.current_title}{candidate.current_title && candidate.current_company && ' at '}{candidate.current_company}</span>
                </div>
              )}
              {candidate?.city && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{candidate.city}{candidate.country ? `, ${candidate.country}` : ''}</span>
                </div>
              )}
              {candidate?.years_experience !== undefined && candidate.years_experience > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span>{candidate.years_experience} years experience</span>
                </div>
              )}
              {profile?.email && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>{profile.email}</span>
                </div>
              )}
              {/* LinkedIn badge */}
              {candidate?.linkedin_verified && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/>
                  </svg>
                  <span className="text-[#0A66C2]">LinkedIn Verified</span>
                  <Shield className="w-3 h-3 text-[#0A66C2]" />
                </div>
              )}
              {candidate?.linkedin_url && !candidate?.linkedin_verified && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor"/>
                  </svg>
                  <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 truncate">LinkedIn Profile</a>
                </div>
              )}
            </>
          )}
        </div>

        {/* Profile Completeness */}
        {!editing && (
          <ProfileCompletenessBar {...getProfileCompleteness(candidate, profile)} />
        )}

        {/* Skills */}
        <div className="bg-[#111] border border-white/[0.06] rounded-xl p-4">
          <h3 className="text-sm font-medium text-white mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-xs text-emerald-400">
                {skill}
                {editing && <button onClick={() => setSkills(skills.filter(s => s !== skill))} className="hover:text-white transition-colors"><X className="w-3 h-3" /></button>}
              </span>
            ))}
            {skills.length === 0 && !editing && <p className="text-xs text-gray-600">No skills added yet</p>}
          </div>
          {editing && (
            <div className="flex items-center gap-2 mt-3">
              <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Add a skill" className="flex-1 bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500/50 focus:outline-none" />
              <button onClick={addSkill} className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
          )}
        </div>

        {/* Referral System — Wasta */}
        {!editing && (
          <div className="bg-[#111] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-medium text-white">Refer & Earn</h3>
              </div>
              {referralStats.total > 0 && (
                <span className="text-xs text-gray-500">{referralStats.total} referral{referralStats.total !== 1 ? 's' : ''}</span>
              )}
            </div>

            <p className="text-xs text-gray-500 mb-4">
              Know someone perfect for a job? Refer them and help them get hired. Wasta matters.
            </p>

            {/* Referral Stats */}
            {referralStats.total > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-[#0a0a0a] rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-white">{referralStats.total}</div>
                  <div className="text-[10px] text-gray-500">Sent</div>
                </div>
                <div className="bg-[#0a0a0a] rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-emerald-400">{referralStats.signed_up}</div>
                  <div className="text-[10px] text-gray-500">Joined</div>
                </div>
                <div className="bg-[#0a0a0a] rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-blue-400">{referralStats.applied}</div>
                  <div className="text-[10px] text-gray-500">Applied</div>
                </div>
                <div className="bg-[#0a0a0a] rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-yellow-400">{referralStats.hired}</div>
                  <div className="text-[10px] text-gray-500">Hired</div>
                </div>
              </div>
            )}

            {/* Create Referral */}
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={referralEmail}
                onChange={(e) => setReferralEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleReferral())}
                placeholder="Friend's email address"
                className="flex-1 bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-emerald-500/50 focus:outline-none"
              />
              <button
                onClick={handleReferral}
                disabled={referralLoading || !referralEmail.trim()}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-lg text-sm text-white font-medium transition-colors whitespace-nowrap"
              >
                {referralLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refer'}
              </button>
            </div>

            {/* Generated Link */}
            {referralLink && (
              <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                <p className="text-xs text-emerald-400 mb-2">Referral link created! Share it:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs text-white bg-[#0a0a0a] rounded px-2 py-1.5 truncate">{referralLink}</code>
                  <button
                    onClick={() => copyReferralLink(referralLink)}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded text-xs text-white font-medium transition-colors"
                  >
                    {linkCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {/* Recent Referrals */}
            {referrals.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-xs text-gray-500 font-medium">Recent Referrals</h4>
                {referrals.slice(0, 5).map((ref: any) => (
                  <div key={ref.id} className="flex items-center justify-between bg-[#0a0a0a] rounded-lg px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{ref.referred_email}</p>
                      {ref.job?.title && <p className="text-[10px] text-gray-500 truncate">for {ref.job.title}</p>}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${
                      ref.status === 'hired' ? 'bg-yellow-500/10 text-yellow-400' :
                      ref.status === 'applied' ? 'bg-blue-500/10 text-blue-400' :
                      ref.status === 'signed_up' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {ref.status === 'signed_up' ? 'Joined' : ref.status.charAt(0).toUpperCase() + ref.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ======================== EMPLOYER / COMPANY PROFILE ========================

interface CompanyData {
  id: string;
  name: string;
  industry?: string;
  size?: string;
  founded_year?: number;
  website?: string;
  description?: string;
  headquarters?: string;
  locations?: string[];
  logo_url?: string;
  cover_image_url?: string;
  intro_video_id?: string;
  trade_license?: string;
  is_verified: boolean;
  jobs_posted: number;
  total_hires: number;
}

interface EmployerData {
  id: string;
  company_id: string;
  role: string;
  company: CompanyData;
}

function EmployerProfile({ user, profile, isSetup }: { user: any; profile: any; isSetup: boolean }) {
  const router = useRouter();
  const [employer, setEmployer] = useState<EmployerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(isSetup);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [form, setForm] = useState({
    company_name: '',
    industry: '',
    size: '',
    founded_year: '',
    website: '',
    description: '',
    headquarters: '',
    full_name: '',
  });

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data } = await getEmployerProfile(user.id);
    if (data) {
      const emp = data as unknown as EmployerData;
      setEmployer(emp);
      setForm({
        company_name: emp.company?.name || '',
        industry: emp.company?.industry || '',
        size: emp.company?.size || '',
        founded_year: emp.company?.founded_year?.toString() || '',
        website: emp.company?.website || '',
        description: emp.company?.description || '',
        headquarters: emp.company?.headquarters || '',
        full_name: profile?.full_name || '',
      });
    }
    setLoading(false);
  }, [user?.id, profile?.full_name]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleSave = async () => {
    if (!user?.id || !employer?.company_id) return;
    setSaving(true);
    setSaveError('');

    try {
      if (form.full_name && form.full_name !== profile?.full_name) {
        const { error: userErr } = await updateUserProfile(user.id, { full_name: form.full_name });
        if (userErr) throw new Error(userErr.message || 'Failed to update name');
      }

      const compRes = await fetch('/api/employer/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: employer.company_id,
          updates: {
            name: form.company_name,
            industry: form.industry,
            size: form.size,
            founded_year: form.founded_year ? parseInt(form.founded_year) : null,
            website: form.website,
            description: form.description,
            headquarters: form.headquarters,
          },
        }),
      });
      const compData = await compRes.json();
      if (!compRes.ok || compData.error) {
        throw new Error(compData.error || 'Failed to save company info');
      }

      await loadProfile();
      setEditing(false);
      if (isSetup) router.push('/employer/dashboard');
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !employer?.company_id || !user?.id) return;
    setUploading(true);
    try {
      // 1. Request upload token
      const tokenRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'video/mp4',
          type: 'company_intro',
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || tokenData.error) {
        throw new Error(tokenData.error || 'Failed to get upload token');
      }
      const { workerUrl, uploadToken, videoId } = tokenData;

      // 2. PUT file directly to Cloudflare Worker
      const putRes = await fetch(workerUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'video/mp4',
          'X-Upload-Token': uploadToken,
        },
        body: file,
      });
      if (!putRes.ok) {
        const errText = await putRes.text().catch(() => '');
        throw new Error(`Upload failed (${putRes.status}): ${errText || 'no response body'}`);
      }

      // 3. Confirm upload
      const confirmRes = await fetch('/api/upload/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      });
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok || confirmData.error) {
        throw new Error(confirmData.error || 'Failed to confirm upload');
      }

      const linkRes = await fetch('/api/employer/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: employer.company_id,
          updates: { intro_video_id: videoId },
        }),
      });
      const linkData = await linkRes.json();
      if (!linkRes.ok || linkData.error) {
        throw new Error(linkData.error || 'Failed to link video to company');
      }
      await loadProfile();
    } catch (err: any) {
      console.error('Company video upload failed:', err?.message || err);
      alert(`Upload failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>;
  }

  const company = employer?.company;

  return (
    <>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">{isSetup ? 'Set Up Company Profile' : 'Company Profile'}</h1>
        <div className="flex items-center gap-2">
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111] border border-white/[0.06] rounded-lg text-sm text-gray-300 hover:text-white transition-colors">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              {!isSetup && (
                <button onClick={() => { setEditing(false); loadProfile(); }} className="w-8 h-8 rounded-lg bg-[#111] border border-white/[0.06] flex items-center justify-center text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-lg text-sm text-white font-medium transition-colors">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {isSetup ? 'Save & Continue' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-4">
        {saveError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">{saveError}</div>
        )}

        {/* Company Intro Video */}
        <div className="bg-[#111] border border-white/[0.06] rounded-xl overflow-hidden">
          {company?.intro_video?.cloudflare_uid ? (
            <div className="aspect-video relative">
              {isR2Video(company.intro_video.cloudflare_uid) ? (
                <video src={getVideoUrl(company.intro_video.cloudflare_uid)} className="w-full h-full object-cover" muted playsInline />
              ) : (
                <iframe src={`${getVideoUrl(company.intro_video.cloudflare_uid)}?muted=true&autoplay=false`} className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen />
              )}
              {editing && (
                <label className="absolute bottom-3 right-3 w-10 h-10 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors">
                  <Camera className="w-5 h-5 text-white" />
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                </label>
              )}
            </div>
          ) : (
            <label className={`flex flex-col items-center justify-center py-12 ${editing ? 'cursor-pointer hover:bg-white/[0.02]' : ''} transition-colors`}>
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                {uploading ? <Loader2 className="w-7 h-7 animate-spin text-emerald-400" /> : <Building2 className="w-7 h-7 text-emerald-400" />}
              </div>
              <p className="text-sm font-medium text-white mb-1">{uploading ? 'Uploading...' : 'Add company intro video'}</p>
              <p className="text-xs text-gray-500">Show candidates what it&apos;s like to work here</p>
              {editing && !uploading && <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />}
            </label>
          )}
        </div>

        {/* Company Info */}
        <div className="bg-[#111] border border-white/[0.06] rounded-xl p-4 space-y-4">
          {editing ? (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Your Name</label>
                <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Company Name</label>
                <input type="text" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Your company name" className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-emerald-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Industry</label>
                <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none">
                  <option value="">Select industry</option>
                  {industries.map((i) => <option key={i.name} value={i.name}>{i.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Company Size</label>
                  <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none">
                    <option value="">Select size</option>
                    {companySizes.map((s) => <option key={s.size} value={s.size}>{s.size} employees</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Founded Year</label>
                  <input type="number" min={1900} max={2026} value={form.founded_year} onChange={(e) => setForm({ ...form, founded_year: e.target.value })} placeholder="e.g. 2020" className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-emerald-500/50 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Headquarters</label>
                <select value={form.headquarters} onChange={(e) => setForm({ ...form, headquarters: e.target.value })} className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none">
                  <option value="">Select city</option>
                  {cities.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Website</label>
                <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://yourcompany.com" className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-emerald-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Company Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell candidates about your company, culture, and what makes you a great place to work..." rows={4} className="w-full bg-[#0a0a0a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-emerald-500/50 focus:outline-none resize-none" />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <Avatar
                  src={profile?.avatar_url}
                  name={profile?.full_name}
                  size="xl"
                  ring={company?.is_verified ? 'emerald' : 'none'}
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-white">{company?.name || 'Company Name'}</h2>
                  {company?.industry && <p className="text-sm text-emerald-400">{company.industry}</p>}
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-1">
                Managed by <span className="text-white">{profile?.full_name}</span>
              </div>

              {company?.description && (
                <div className="pt-2">
                  <p className="text-sm text-gray-400 leading-relaxed">{company.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                {company?.headquarters && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                    <span>{company.headquarters}</span>
                  </div>
                )}
                {company?.size && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                    <span>{company.size} employees</span>
                  </div>
                )}
                {company?.founded_year && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                    <span>Founded {company.founded_year}</span>
                  </div>
                )}
                {company?.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Globe className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 truncate">{company.website.replace(/^https?:\/\//, '')}</a>
                  </div>
                )}
              </div>

              {profile?.email && (
                <div className="flex items-center gap-2 text-sm text-gray-400 pt-1">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-gray-500" />
                  <span>{profile.email}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Company Stats */}
        {!editing && (
          <div className="bg-[#111] border border-white/[0.06] rounded-xl p-4">
            <h3 className="text-sm font-medium text-white mb-3">Company Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-white">{company?.jobs_posted || 0}</div>
                <div className="text-xs text-gray-500">Jobs Posted</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{company?.total_hires || 0}</div>
                <div className="text-xs text-gray-500">Total Hires</div>
              </div>
            </div>
            {company?.is_verified ? (
              <div className="flex items-center gap-2 mt-4 text-sm text-emerald-400">
                <Check className="w-4 h-4" />
                <span>Verified Company</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-4 text-sm text-yellow-500">
                <FileText className="w-4 h-4" />
                <span>Verification pending</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ======================== MAIN PROFILE PAGE ========================

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetup = searchParams.get('setup') === 'true';

  const { user, profile, initialize, signOut } = useAuthStore();

  useEffect(() => { initialize(); }, [initialize]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isEmployer = profile?.type === 'employer';

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {isEmployer ? (
        <EmployerProfile user={user} profile={profile} isSetup={isSetup} />
      ) : (
        <CandidateProfile user={user} profile={profile} isSetup={isSetup} />
      )}

      {/* Sign Out — always visible in non-edit mode */}
      <div className="px-4 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto mt-4">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#111] border border-white/[0.06] rounded-xl text-sm text-red-400 hover:border-red-500/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
