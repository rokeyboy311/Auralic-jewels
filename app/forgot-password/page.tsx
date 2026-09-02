'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, KeyRound, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
      } else {
        setErrorMsg(data.error || 'Failed to process request.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'System connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#faf8f5] px-4 py-16">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 border border-[#ebdccd] shadow-xl">
        <div className="text-center mb-10">
          <KeyRound className="w-8 h-8 text-[#9b7e46] mx-auto mb-4" />
          <h1 className="font-serif text-3xl text-[#141210] uppercase mb-2">Vault Recovery</h1>
          <p className="text-xs text-[#73685a] uppercase tracking-widest font-medium">
            Reset Your Access
          </p>
        </div>

        {isSuccess ? (
          <div className="text-center space-y-6">
            <div className="bg-[#ede5d8] p-4 text-[#141210] text-sm leading-relaxed border border-[#c5b49e]">
              A secure recovery link has been dispatched to <strong>{email}</strong>. 
              Please check your inbox (and spam folder) to reset your password.
            </div>
            <Link href="/login" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#9b7e46] hover:text-[#141210] font-semibold transition-colors mt-4">
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

            <div className="space-y-1.5 relative">
              <label htmlFor="email" className="text-[10px] uppercase tracking-wider text-[#73685a] font-semibold">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c5b49e]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#faf8f5] border border-[#ebdccd] text-sm focus:outline-none focus:border-[#9b7e46] transition-colors"
                  placeholder="client@example.com"
                  required
                />
              </div>
              <p className="text-[10px] text-[#9ca3af] mt-1">
                We will send a secure transmission with a link to reset your password.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#141210] text-white py-3.5 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#9b7e46] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
                  <span>Transmitting...</span>
                </>
              ) : (
                'Request Reset Link'
              )}
            </button>

            <div className="text-center pt-4 border-t border-[#ebdccd]/50">
              <Link href="/login" className="text-[10px] text-[#73685a] uppercase tracking-widest hover:text-[#9b7e46] transition-colors">
                Return to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
