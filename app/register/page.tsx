'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-[#9b7e46] border-t-transparent animate-spin rounded-full mx-auto" />
        <p className="text-xs uppercase tracking-widest text-[#73685a]">Directing to Client Registration...</p>
      </div>
    </div>
  );
}
