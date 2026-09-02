'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Lock, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { success } = useToast();

  useEffect(() => {
    if (!token) {
      setErrorMsg('Invalid or missing secure token. Please request a new recovery link.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        success('Access Restored', 'Your new vault combination has been secured.');
      } else {
        setErrorMsg(data.error || 'Failed to reset password. The link may have expired.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'System connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="text-center mb-10">
        <KeyRound className="w-8 h-8 text-[#9b7e46] mx-auto mb-4" />
        <h1 className="font-serif text-3xl text-[#141210] uppercase mb-2">Secure Combination</h1>
        <p className="text-xs text-[#73685a] uppercase tracking-widest font-medium">
          Establish New Password
        </p>
      </div>

      {isSuccess ? (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-[#141210] text-sm leading-relaxed border border-[#c5b49e] p-4 bg-[#ede5d8]">
            Your password has been successfully reset. Your vault access is fully restored.
          </p>
          <Link href="/login" className="inline-flex items-center justify-center w-full bg-[#141210] text-white py-3.5 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#9b7e46] transition-colors gap-2 mt-4">
            Return to Login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs text-center">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5 relative">
              <label htmlFor="password" className="text-[10px] uppercase tracking-wider text-[#73685a] font-semibold">
                New Combination
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c5b49e]" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#faf8f5] border border-[#ebdccd] text-sm focus:outline-none focus:border-[#9b7e46] transition-colors"
                  placeholder="Enter new password"
                  required
                  disabled={!token}
                />
              </div>
            </div>

            <div className="space-y-1.5 relative">
              <label htmlFor="confirmPassword" className="text-[10px] uppercase tracking-wider text-[#73685a] font-semibold">
                Confirm Combination
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c5b49e]" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#faf8f5] border border-[#ebdccd] text-sm focus:outline-none focus:border-[#9b7e46] transition-colors"
                  placeholder="Confirm new password"
                  required
                  disabled={!token}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="w-full bg-[#141210] text-white py-3.5 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#9b7e46] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
                <span>Securing...</span>
              </>
            ) : (
              'Secure New Combination'
            )}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#faf8f5] px-4 py-16">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 border border-[#ebdccd] shadow-xl">
        <Suspense fallback={<div className="text-center p-10 text-sm text-[#73685a] font-mono tracking-widest uppercase">Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
