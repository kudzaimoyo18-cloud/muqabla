'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Video, Mail, Lock, User, ArrowRight, Loader2, Briefcase, UserCircle, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

type Step = 'details' | 'role';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || '';
  const refJob = searchParams.get('job') || '';

  const [step, setStep] = useState<Step>('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [referrerName, setReferrerName] = useState('');

  // Look up referral code
  useEffect(() => {
    if (!refCode) return;
    fetch(`/api/referrals/${refCode}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.valid) setReferrerName(data.referrerName);
      })
      .catch(() => {});
  }, [refCode]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) return;
    setError('');
    setStep('role');
  };

  const handleRoleSelect = async (role: 'candidate' | 'employer') => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      // Redirect to verify page — user must confirm email before signing in
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (authError) throw authError;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  const handleLinkedinSignup = async () => {
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (authError) throw authError;
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with LinkedIn');
    }
  };

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
          {step === 'details' ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
              <p className="text-gray-400 text-sm mb-8">Join the future of hiring in the GCC</p>

              {referrerName && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 mb-6 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-emerald-400">
                    <span className="font-medium text-white">{referrerName}</span> referred you to Muqabla
                  </span>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">{error}</div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required className="w-full bg-[#111] border border-white/[0.06] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:border-emerald-500/50 focus:outline-none transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required className="w-full bg-[#111] border border-white/[0.06] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:border-emerald-500/50 focus:outline-none transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 chars, upper + lower + number" required minLength={8} className="w-full bg-[#111] border border-white/[0.06] rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:border-emerald-500/50 focus:outline-none transition-colors" />
                  </div>
                  <p className="text-[11px] text-gray-600 mt-1">Must include uppercase, lowercase, and a number</p>
                </div>

                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors text-sm">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-gray-600">or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              <div className="space-y-3">
                <button onClick={handleGoogleSignup} className="w-full flex items-center justify-center gap-3 bg-[#111] border border-white/[0.06] hover:border-white/[0.12] text-white font-medium py-3 rounded-lg transition-colors text-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>

                <button onClick={handleLinkedinSignup} className="w-full flex items-center justify-center gap-3 bg-[#111] border border-white/[0.06] hover:border-white/[0.12] text-white font-medium py-3 rounded-lg transition-colors text-sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/>
                  </svg>
                  Continue with LinkedIn
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-8">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign in</Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">How will you use Muqabla?</h1>
              <p className="text-gray-400 text-sm mb-8">Choose your role to get started</p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">{error}</div>
              )}

              <div className="space-y-4">
                <button onClick={() => handleRoleSelect('candidate')} disabled={loading} className="w-full flex items-start gap-4 bg-[#111] border border-white/[0.06] hover:border-emerald-500/30 rounded-xl p-5 text-left transition-colors group">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                    <UserCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white mb-1">I&apos;m a Job Seeker</div>
                    <div className="text-sm text-gray-400">Browse jobs, record your video profile, and apply with a swipe</div>
                  </div>
                </button>

                <button onClick={() => handleRoleSelect('employer')} disabled={loading} className="w-full flex items-start gap-4 bg-[#111] border border-white/[0.06] hover:border-emerald-500/30 rounded-xl p-5 text-left transition-colors group">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                    <Briefcase className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white mb-1">I&apos;m an Employer</div>
                    <div className="text-sm text-gray-400">Post jobs, review video applications, and find top talent</div>
                  </div>
                </button>
              </div>

              {loading && (
                <div className="flex items-center justify-center mt-6">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
