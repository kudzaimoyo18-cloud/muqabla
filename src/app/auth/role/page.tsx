'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Video, UserCircle, Briefcase, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function RoleSelectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
      setChecking(false);
    };
    checkUser();
  }, [router]);

  const handleRoleSelect = async (role: 'candidate' | 'employer') => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'User';

      const res = await fetch('/api/auth/oauth-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          fullName,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create profile');

      router.push('/profile?setup=true');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <div className="px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5 w-fit">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Video className="w-4 h-4 text-white" />
          </div>
          <span className="text-[17px] font-semibold text-white tracking-tight">Muqabla</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-2">How will you use Muqabla?</h1>
          <p className="text-gray-400 text-sm mb-8">Choose your role to get started</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect('candidate')}
              disabled={loading}
              className="w-full flex items-start gap-4 p-5 bg-[#111] border border-white/[0.06] hover:border-emerald-500/30 rounded-xl text-left transition-colors disabled:opacity-50"
            >
              <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                <UserCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">I&apos;m a Job Seeker</h3>
                <p className="text-xs text-gray-500 mt-1">Browse jobs, record your video profile, and apply with a swipe</p>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('employer')}
              disabled={loading}
              className="w-full flex items-start gap-4 p-5 bg-[#111] border border-white/[0.06] hover:border-emerald-500/30 rounded-xl text-left transition-colors disabled:opacity-50"
            >
              <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">I&apos;m an Employer</h3>
                <p className="text-xs text-gray-500 mt-1">Post jobs, review video applications, and find top talent</p>
              </div>
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Setting up your account...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
