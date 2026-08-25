'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { brandConfig } from '@/lib/brandConfig';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordView, setForgotPasswordView] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, register, loginWithGoogle } = useAuth();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    let result: any = false;
    if (activeTab === 'signup') {
      result = await register(name, email, phone, password);
    } else {
      result = await login(email, password);
    }
    setIsSubmitting(false);
    if (result) {
      if (typeof result === 'object' && result.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirectPath);
      }
    } else {
      setErrorMessage('Authentication unsuccessful. Please verify your credentials.');
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    const result = await loginWithGoogle();
    setIsSubmitting(false);
    if (result) {
      if (typeof result === 'object' && result.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirectPath);
      }
    } else {
      setErrorMessage('Google authentication could not be completed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block group mb-2">
          <span className="font-serif text-3xl sm:text-4xl text-[#141210] tracking-wider block">
            {brandConfig.name.toUpperCase()}
          </span>
          <span className="text-[10px] tracking-[0.4em] uppercase text-[#9b7e46] block font-medium mt-0.5">
            {brandConfig.tagline}
          </span>
        </Link>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl border border-[#c5b49e]/60 sm:px-10 relative">
          {/* Header */}
          <div className="text-center mb-6 space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.35em] text-[#9b7e46] uppercase font-semibold">
              <Sparkles className="w-3 h-3 text-[#d4af37]" />
              <span>Customer Access</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#141210] font-normal">
              {forgotPasswordView
                ? 'Password Recovery'
                : activeTab === 'signin'
                ? 'Sign In to Your Account'
                : 'Create Client Profile'}
            </h2>
            <p className="text-xs text-[#73685a] leading-relaxed">
              {forgotPasswordView
                ? 'Enter your email to receive recovery instructions.'
                : activeTab === 'signin'
                ? 'Access your private jewellery vault, orders, and custom commissions.'
                : 'Create your account to initiate bespoke commissions and track shipments.'}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-[#fdf2f2] border border-[#f8b4b4] text-[#9b1c1c] text-xs text-center">
              {errorMessage}
            </div>
          )}

          {forgotPasswordView ? (
            <div className="space-y-4">
              {resetEmailSent ? (
                <div className="text-center py-6 space-y-3 bg-[#faf8f5] border border-[#c5b49e]/40 p-5">
                  <CheckCircle2 className="w-10 h-10 text-[#9b7e46] mx-auto" />
                  <h4 className="font-serif text-lg text-[#141210]">Instructions Sent</h4>
                  <p className="text-xs text-[#73685a] leading-relaxed">
                    If an account is associated with <strong>{email}</strong>, a secure reset link has been dispatched to your email.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordView(false);
                      setResetEmailSent(false);
                    }}
                    className="mt-2 text-xs text-[#9b7e46] hover:underline uppercase tracking-wider font-semibold"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setResetEmailSent(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="login-page-forgot-email" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#998b79] absolute left-3.5 top-3" />
                      <input
                        id="login-page-forgot-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="customer@domain.com"
                        className="w-full bg-[#faf8f5] border border-[#c5b49e]/70 pl-10 pr-3 py-2.5 text-xs text-[#141210] placeholder:text-[#a89b8c] focus:outline-none focus:border-[#9b7e46]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordView(false)}
                      className="text-xs text-[#73685a] hover:text-[#141210] hover:underline"
                    >
                      Return to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Tab Switcher */}
              <div className="grid grid-cols-2 bg-[#ede5d8]/70 p-1 border border-[#c5b49e]/50">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMessage('');
                  }}
                  className={`py-2 text-xs uppercase tracking-widest font-medium transition-all ${
                    activeTab === 'signin'
                      ? 'bg-white text-[#141210] shadow-sm font-semibold'
                      : 'text-[#73685a] hover:text-[#141210]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMessage('');
                  }}
                  className={`py-2 text-xs uppercase tracking-widest font-medium transition-all ${
                    activeTab === 'signup'
                      ? 'bg-white text-[#141210] shadow-sm font-semibold'
                      : 'text-[#73685a] hover:text-[#141210]'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-3 bg-[#faf8f5] hover:bg-[#f2ece2] border border-[#c5b49e]/80 text-[#141210] text-xs font-medium flex items-center justify-center gap-3 transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-[#c5b49e]/50"></div>
                <span className="bg-white px-3 text-[11px] text-[#73685a] uppercase tracking-wider">
                  or email
                </span>
                <div className="w-full border-t border-[#c5b49e]/50"></div>
              </div>

              {/* Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                {activeTab === 'signup' && (
                  <div>
                    <label htmlFor="login-page-name-input" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-[#998b79] absolute left-3.5 top-3" />
                      <input
                        id="login-page-name-input"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Elena Rostova"
                        className="w-full bg-[#faf8f5] border border-[#c5b49e]/70 pl-10 pr-3 py-2.5 text-xs text-[#141210] placeholder:text-[#a89b8c] focus:outline-none focus:border-[#9b7e46]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="login-page-email-input" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#998b79] absolute left-3.5 top-3" />
                    <input
                      id="login-page-email-input"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="customer@domain.com"
                      className="w-full bg-[#faf8f5] border border-[#c5b49e]/70 pl-10 pr-3 py-2.5 text-xs text-[#141210] placeholder:text-[#a89b8c] focus:outline-none focus:border-[#9b7e46]"
                    />
                  </div>
                </div>

                {activeTab === 'signup' && (
                  <div>
                    <label htmlFor="login-page-phone-input" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                      Phone (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#998b79] absolute left-3.5 top-3" />
                      <input
                        id="login-page-phone-input"
                        name="tel"
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (212) 555-0199"
                        className="w-full bg-[#faf8f5] border border-[#c5b49e]/70 pl-10 pr-3 py-2.5 text-xs text-[#141210] placeholder:text-[#a89b8c] focus:outline-none focus:border-[#9b7e46]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="login-page-password-input" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium">
                      Password *
                    </label>
                    {activeTab === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setForgotPasswordView(true)}
                        className="text-[11px] text-[#9b7e46] hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#998b79] absolute left-3.5 top-3" />
                    <input
                      id="login-page-password-input"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={activeTab === 'signin' ? 'current-password' : 'new-password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#faf8f5] border border-[#c5b49e]/70 pl-10 pr-10 py-2.5 text-xs text-[#141210] placeholder:text-[#a89b8c] focus:outline-none focus:border-[#9b7e46]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#998b79] hover:text-[#141210] p-0.5"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {activeTab === 'signin' && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#9b7e46]"
                    />
                    <label htmlFor="remember-me" className="text-xs text-[#73685a]">
                      Remember this device
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-60 cursor-pointer mt-2"
                >
                  <span>
                    {isSubmitting
                      ? 'Authenticating...'
                      : activeTab === 'signin'
                      ? 'Sign In'
                      : 'Create Account'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#d4af37]" />
                </button>
              </form>

              {/* Bottom link */}
              <div className="text-center pt-2 text-xs text-[#73685a]">
                {activeTab === 'signin' ? (
                  <p>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('signup')}
                      className="text-[#9b7e46] hover:underline font-semibold"
                    >
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('signin')}
                      className="text-[#9b7e46] hover:underline font-semibold"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Security Guarantee */}
          <div className="mt-6 pt-4 border-t border-[#ebdccd] flex items-center justify-center gap-1.5 text-[10px] text-[#8c7e6e]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9b7e46]" />
            <span>256-Bit SSL Encrypted • Confidential Aurelic Jewels Data Protection</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
