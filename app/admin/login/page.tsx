'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, KeyRound, Eye, EyeOff, RefreshCw, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function AdminLoginPage() {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState('');
  const [authSuccessMessage, setAuthSuccessMessage] = useState('');

  const { login } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  const handleAdminAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMessage('');
    setAuthSuccessMessage('');
    setIsAuthenticating(true);

    try {
      const userResult = await login(adminEmail, adminPassword);
      if (userResult && typeof userResult === 'object' && userResult.role === 'admin') {
        setAuthSuccessMessage('Authentication Successful. Entering Workshop Control Center...');
        success('Access Granted', 'Welcome back, Workshop Director.');
        setTimeout(() => {
          window.location.href = '/admin';
        }, 600);
      } else if (userResult) {
        // Logged in but not an admin
        setIsAuthenticating(false);
        setAuthErrorMessage('Access Denied: Your account does not have administrative privileges.');
        error('Access Denied', 'Insufficient security clearance.');
        // Optionally logout if they are not supposed to be logged in at all
      } else {
        setIsAuthenticating(false);
        setAuthErrorMessage('Invalid administrator credentials. Please verify email and password.');
        error('Access Denied', 'Invalid administrator credentials.');
      }
    } catch {
      setIsAuthenticating(false);
      setAuthErrorMessage('Could not connect to authentication vault.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#faf8f5]/60">
      <div className="w-full max-w-md bg-white border border-[#c5b49e]/50 p-8 sm:p-10 shadow-xl space-y-6">
        {/* Header Badge */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-[#141210] text-[#d4af37] flex items-center justify-center rounded-full mx-auto shadow-md border border-[#c5b49e]/40">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-[0.35em] text-[#9b7e46] font-semibold block">
              Aurelic Jewels Paris
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#141210] mt-1 font-light">
              Workshop Admin Portal
            </h1>
          </div>
          <p className="text-xs text-[#73685a] leading-relaxed max-w-xs mx-auto">
            Please enter your administrator email and password to access the executive dashboard.
          </p>
        </div>

        {/* Success Banner */}
        {authSuccessMessage && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 text-xs flex items-center gap-2.5 rounded-sm animate-pulse">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{authSuccessMessage}</span>
          </div>
        )}

        {/* Error Banner */}
        {authErrorMessage && (
          <div className="bg-rose-50 border border-rose-300 text-rose-900 px-4 py-3 text-xs flex items-center gap-2.5 rounded-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{authErrorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-login-email-input" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1.5 flex items-center justify-between">
              <span>Admin Email Address</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#73685a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-login-email-input"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={adminEmail}
                onChange={(e) => {
                  setAdminEmail(e.target.value);
                  setAuthErrorMessage('');
                }}
                placeholder="admin@aurelic.paris"
                className="w-full bg-[#faf8f5] border border-[#c5b49e]/60 pl-10 pr-3.5 py-3 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-login-password-input" className="block text-[11px] uppercase tracking-wider text-[#4a4237] font-medium mb-1.5 flex items-center justify-between">
              <span>Authentication Password</span>
              <span className="text-[10px] text-[#73685a]">Admin Key</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#73685a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-login-password-input"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setAuthErrorMessage('');
                }}
                placeholder="••••••••••••"
                className="w-full bg-[#faf8f5] border border-[#c5b49e]/60 pl-10 pr-10 py-3 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46] focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#73685a] hover:text-[#141210] transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full py-3.5 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-4 shadow-sm"
          >
            {isAuthenticating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#d4af37]" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-[#d4af37]" />
                <span>Sign In to Admin Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Return link to atelier storefront */}
        <div className="pt-2 text-center border-t border-[#ebdccd]">
          <p className="text-[11px] text-[#73685a]">
            Customer?{' '}
            <Link href="/" className="text-[#9b7e46] hover:underline font-medium inline-flex items-center gap-1">
              <span>Return to Aurelic Jewels Atelier</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
