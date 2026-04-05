'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Video, ArrowRight, Zap, Shield, Globe, Play, Users, Briefcase, CheckCircle, ChevronDown } from 'lucide-react';
import RealismButton from '@/components/ui/RealismButton';

const ParticleTextEffect = dynamic(
  () => import('@/components/ui/ParticleTextEffect').then(mod => ({ default: mod.ParticleTextEffect })),
  { ssr: false }
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/[0.04]">
        <div className="flex items-center justify-between px-6 py-3.5 max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">Muqabla</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors hidden sm:block"
            >
              Sign In
            </Link>
            <RealismButton text="Get Started" href="/auth/signup" />
          </div>
        </div>
      </nav>

      {/* Hero with Particle Effect */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
        {/* Particle canvas as background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <ParticleTextEffect
            words={["MUQABLA", "مقابلة", "INTERVIEW"]}
            className="w-full h-full"
          />
        </div>

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-emerald-400 tracking-wide uppercase">Now live in the GCC</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] mb-6 tracking-tight">
            Your Video Is
            <br />
            <span className="text-emerald-400">Your Resume</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Record once, apply everywhere. The video-first hiring platform
            for the UAE, Saudi Arabia, Qatar, and beyond.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-16">
            <RealismButton text="Start Free" href="/auth/signup" icon={<ArrowRight className="w-4 h-4" />} />
            <RealismButton text="Watch Demo" href="/auth/login" variant="secondary" icon={<Play className="w-4 h-4" />} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { value: '3x', label: 'Faster Hiring' },
              { value: '85%', label: 'Match Rate' },
              { value: 'Zero', label: 'CV Required' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-emerald-400">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-28 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-medium text-emerald-400 tracking-widest uppercase mb-3 block">How It Works</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Three Steps to Your Next Role</h2>
          <p className="text-gray-400 max-w-xl mx-auto">No more uploading PDFs. No more cover letters. Just you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Video,
              step: '01',
              title: 'Record Your Video',
              desc: 'Create a 60-second video intro showcasing your personality and skills. One video for all applications.',
            },
            {
              icon: Globe,
              step: '02',
              title: 'Discover Jobs',
              desc: 'Swipe through job opportunities from top GCC employers. Watch their company intros to find the right fit.',
            },
            {
              icon: Zap,
              step: '03',
              title: 'Apply Instantly',
              desc: 'Swipe left to apply with your video profile. No forms, no waiting. Employers see the real you.',
            },
          ].map((card) => (
            <div
              key={card.step}
              className="group relative bg-[#111] border border-white/[0.06] rounded-2xl p-8 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/50 transition-all duration-300" />
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <card.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-xs font-mono text-emerald-400/50 tracking-wider">STEP {card.step}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Candidates & Employers */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Candidates */}
          <div className="bg-gradient-to-br from-emerald-500/[0.08] to-transparent border border-emerald-500/10 rounded-3xl p-8 sm:p-10">
            <div className="w-12 h-12 bg-emerald-500/15 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">For Candidates</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Stand out beyond a paper resume. Let employers see your energy, communication skills, and personality.
            </p>
            <ul className="space-y-3">
              {[
                'Record once, apply to hundreds of jobs',
                'TikTok-style job discovery feed',
                'Instant applications with one swipe',
                'AI-powered skill detection from your video',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <RealismButton text="Find Jobs" href="/auth/signup" icon={<ArrowRight className="w-4 h-4" />} />
            </div>
          </div>

          {/* Employers */}
          <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.06] rounded-3xl p-8 sm:p-10">
            <div className="w-12 h-12 bg-white/[0.06] rounded-xl flex items-center justify-center mb-6">
              <Briefcase className="w-6 h-6 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">For Employers</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              See candidates before the interview. Reduce screening time by 80% with video-first applications.
            </p>
            <ul className="space-y-3">
              {[
                'Video applications replace CV screening',
                'Post jobs with your own company video',
                'Verified candidate profiles with ID checks',
                'Built for GCC hiring standards and culture',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <RealismButton text="Post a Job" href="/auth/signup" variant="secondary" icon={<ArrowRight className="w-4 h-4" />} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-medium text-emerald-400 tracking-widest uppercase mb-3 block">Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Built for the Region</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Play, title: 'Video-First', desc: 'Show who you really are beyond a paper CV' },
            { icon: Shield, title: 'Verified', desc: 'All employers verified with trade licenses' },
            { icon: Users, title: 'GCC Focused', desc: 'UAE, Saudi, Qatar, Kuwait, Bahrain, Oman' },
            { icon: Zap, title: 'Instant Apply', desc: 'Swipe to apply — your video speaks for you' },
          ].map((feature) => (
            <div key={feature.title} className="group bg-[#111] border border-white/[0.06] rounded-2xl p-6 text-center hover:border-emerald-500/20 transition-all duration-300">
              <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <feature.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1.5">{feature.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial / Social Proof */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <div className="bg-[#111] border border-white/[0.06] rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <blockquote className="text-xl sm:text-2xl font-medium text-white leading-relaxed mb-6">
              &ldquo;I got hired within a week. Employers actually watched my video and said they already felt like they knew me before the interview.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-emerald-400">SA</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">Sarah A.</div>
                <div className="text-xs text-gray-500">Marketing Manager, Dubai</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-28 max-w-4xl mx-auto text-center">
        <div className="relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5">
              Ready to Get Hired?
            </h2>
            <p className="text-gray-400 mb-10 max-w-lg mx-auto text-lg">
              Join thousands of candidates and employers across the GCC who are hiring differently.
            </p>
            <RealismButton text="Create Free Account" href="/auth/signup" icon={<CheckCircle className="w-5 h-5" />} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-10 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Muqabla</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact</span>
          </div>
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} Muqabla. Built for the GCC.</p>
        </div>
      </footer>
    </div>
  );
}
