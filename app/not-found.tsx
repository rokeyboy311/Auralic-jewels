'use client';


import React from 'react';
import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center space-y-6 max-w-md bg-[#faf8f5] border border-[#c5b49e]/40 p-8 sm:p-12">
        <div className="w-16 h-16 bg-[#ede5d8] text-[#9b7e46] rounded-full flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#9b7e46] font-bold block">
            404 • Page Not Found
          </span>
          <h1 className="font-serif text-3xl text-[#141210]">Creation Not Found</h1>
          <p className="text-xs text-[#73685a] leading-relaxed">
            The page or jewellery archive you are searching for does not exist or has been relocated to our private vault.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-[0.2em] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Aurelic Jewels</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
