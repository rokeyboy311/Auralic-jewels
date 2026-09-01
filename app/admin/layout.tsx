'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !isAdmin && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [mounted, loading, isAdmin, pathname, router]);

  // Don't apply layout for the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!mounted || loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center text-[#73685a] text-xs tracking-wider uppercase font-semibold">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#9b7e46] border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying Security Clearance...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col pl-[260px] w-full">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
