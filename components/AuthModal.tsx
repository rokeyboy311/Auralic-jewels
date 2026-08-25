'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
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
import { requestPasswordReset } from '@/lib/api';
import { brandConfig } from '@/lib/brandConfig';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialMode);
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
  const [authError, setAuthError] = useState<string | null>(null);

  const { login, register, loginWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    let ok: any = false;
    if (activeTab === 'signup') {
      ok = await register(name, email, phone, password);
    } else {
      ok = await login(email, password);
    }
    setIsSubmitting(false);
    if (ok) {
      if (typeof ok === 'object' && ok.role === 'admin') {
        window.location.href = '/admin';
      } else {
        onClose();
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    const ok: any = await loginWithGoogle();
    setIsSubmitting(false);
    if (ok) {
      if (typeof ok === 'object' && ok.role === 'admin') {
        window.location.href = '/admin';
      } else {
        onClose();
      }
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
      setResetEmailSent(true);
    } catch {
      setResetEmailSent(true); // Don't expose failure
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm p-4 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-[#faf8f5] shadow-2xl border border-[#c5b49e]/60 p-6 sm:p-8 relative my-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#73685a] hover:text-[#141210] hover:bg-[#ebdccd]/40 rounded-full transition-colors cursor-pointer"
            aria-label="Close dialogue"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-[#f0e7dc] border border-[#d8c7b5] text-[10px] uppercase tracking-[0.25em] text-[#9b7e46] mb-3">
              <Sparkles className="w-3 h-3" />
              <span>Aurelic Jewels</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#141210] font-normal tracking-wide">
              {forgotPasswordView
                ? 'Security Recovery'
                : activeTab === 'signin'
                ? 'Customer Authentication'
                : 'Acquisition Account'}
            </h2>
            <p className="text-xs text-[#73685a] mt-1.5 max-w-xs mx-auto leading-relaxed">
              {forgotPasswordView
                ? 'Enter your registered email to receive authentication recovery instructions.'
                : activeTab === 'signin'
                ? 'Access bespoke commissions, order vault dossiers, and private concierge privileges.'
                : 'Create your private workshop membership profile.'}
            </p>
          </div>

          {/* Forgot Password View */}
          {forgotPasswordView ? (
            <div className="space-y-4">
              {resetEmailSent ? (
                <div className="text-center py-6 space-y-3 bg-[#f2ece2] p-4 border border-[#ebdccd]">
                  <CheckCircle2 className="w-10 h-10 text-[#9b7e46] mx-auto" />
                  <h3 className="font-serif text-lg text-[#141210]">Recovery Dispatched</h3>
                  <p className="text-xs text-[#73685a] leading-relaxed">
                    If an account is associated with <strong>{email}</strong>, password reset instructions have been transmitted.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordView(false);
                      setResetEmailSent(false);
                    }}
                    className="mt-4 px-6 py-2.5 bg-[#141210] text-white text-xs uppercase tracking-widest hover:bg-[#9b7e46] transition-colors cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="auth-modal-forgot-email" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#998b79] absolute left-3.5 top-3" />
                      <input
                        id="auth-modal-forgot-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="customer@domain.com"
                        className="w-full bg-white border border-[#c5b49e]/70 pl-10 pr-3 py-2.5 text-xs text-[#141210] placeholder:text-[#a89b8c] focus:outline-none focus:border-[#9b7e46]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-60 cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Transmitting...' : 'Send Recovery Link'}</span>
                    <ArrowRight className="w-4 h-4 text-[#d4af37]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setForgotPasswordView(false)}
                    className="w-full text-center text-xs text-[#73685a] hover:text-[#141210] hover:underline pt-2 cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Tabs Switcher */}
              <div className="grid grid-cols-2 border-b border-[#ebdccd]">
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className={`pb-2.5 text-xs uppercase tracking-widest font-medium transition-all text-center relative cursor-pointer ${
                    activeTab === 'signin' ? 'text-[#141210]' : 'text-[#8c7e6e] hover:text-[#141210]'
                  }`}
                >
                  Sign In
                  {activeTab === 'signin' && (
                    <motion.div
                      layoutId="activeModalTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9b7e46]"
                    />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className={`pb-2.5 text-xs uppercase tracking-widest font-medium transition-all text-center relative cursor-pointer ${
                    activeTab === 'signup' ? 'text-[#141210]' : 'text-[#8c7e6e] hover:text-[#141210]'
                  }`}
                >
                  Create Account
                  {activeTab === 'signup' && (
                    <motion.div
                      layoutId="activeModalTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#9b7e46]"
                    />
                  )}
                </button>
              </div>

              {/* Google One-Tap / OAuth Button */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-white hover:bg-[#f7f2ea] border border-[#c5b49e]/80 text-[#141210] text-xs font-medium flex items-center justify-center gap-3 transition-colors shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#ebdccd]" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-[#8c7e6e]">
                    <span className="bg-[#faf8f5] px-3">or continue with email</span>
                  </div>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                {activeTab === 'signup' && (
                  <div>
                    <label htmlFor="auth-modal-name-input" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-[#998b79] absolute left-3.5 top-3" />
                      <input
                        id="auth-modal-name-input"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Lady Jacqueline Vance"
                        className="w-full bg-white border border-[#c5b49e]/70 pl-10 pr-3 py-2.5 text-xs text-[#141210] placeholder:text-[#a89b8c] focus:outline-none focus:border-[#9b7e46]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="auth-modal-email-input" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#998b79] absolute left-3.5 top-3" />
                    <input
                      id="auth-modal-email-input"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="customer@domain.com"
                      className="w-full bg-white border border-[#c5b49e]/70 pl-10 pr-3 py-2.5 text-xs text-[#141210] placeholder:text-[#a89b8c] focus:outline-none focus:border-[#9b7e46]"
                    />
                  </div>
                </div>

                {activeTab === 'signup' && (
                  <div>
                    <label htmlFor="auth-modal-phone-input" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#998b79] absolute left-3.5 top-3" />
                      <input
                        id="auth-modal-phone-input"
                        name="tel"
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (212) 555-0199"
                        className="w-full bg-white border border-[#c5b49e]/70 pl-10 pr-3 py-2.5 text-xs text-[#141210] placeholder:text-[#a89b8c] focus:outline-none focus:border-[#9b7e46]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="auth-modal-password-input" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium">
                      Password *
                    </label>
                    {activeTab === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setForgotPasswordView(true)}
                        className="text-[11px] text-[#9b7e46] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#998b79] absolute left-3.5 top-3" />
                    <input
                      id="auth-modal-password-input"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={activeTab === 'signin' ? 'current-password' : 'new-password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white border border-[#c5b49e]/70 pl-10 pr-10 py-2.5 text-xs text-[#141210] placeholder:text-[#a89b8c] focus:outline-none focus:border-[#9b7e46]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-[#998b79] hover:text-[#141210] p-0.5 cursor-pointer"
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
                      id="remember-me-modal"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#9b7e46]"
                    />
                    <label htmlFor="remember-me-modal" className="text-xs text-[#73685a]">
                      Remember this browser
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
                      ? 'Processing...'
                      : activeTab === 'signin'
                      ? 'Sign In'
                      : 'Create Account'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#d4af37]" />
                </button>
              </form>

              {/* Bottom Switch Link */}
              <div className="text-center pt-2 text-xs text-[#73685a]">
                {activeTab === 'signin' ? (
                  <p>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('signup')}
                      className="text-[#9b7e46] hover:underline font-semibold cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('signin')}
                      className="text-[#9b7e46] hover:underline font-semibold cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Security Footer */}
          <div className="mt-5 pt-3 border-t border-[#ebdccd] flex items-center justify-center gap-1.5 text-[10px] text-[#8c7e6e]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9b7e46]" />
            <span>256-Bit SSL Encrypted • Confidential Workshop Data Protection</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
