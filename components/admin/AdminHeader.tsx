'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, Bell, Search, Globe, Menu } from 'lucide-react';

export default function AdminHeader() {
  const pathname = usePathname();

  // Helper to format the current page title based on pathname
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length > 1) {
      const mainSection = pathSegments[1];
      return mainSection.charAt(0).toUpperCase() + mainSection.slice(1);
    }
    return 'Dashboard';
  };

  return (
    <header className="h-20 bg-white border-b border-[#E8E0D5] sticky top-0 z-40 px-6 sm:px-8 flex items-center justify-between">
      {/* Left side: Hamburger and Title */}
      <div className="flex items-center gap-6">
        <button className="text-[#111111] hover:text-[#C9A45C] transition-colors p-1">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-[#111111]">{getPageTitle()}</h1>
      </div>

      {/* Right side: Search, Notifications, Language */}
      <div className="flex items-center gap-5">
        <div className="relative w-64 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F665B]" />
          <input 
            type="text" 
            placeholder="Search here..." 
            className="w-full bg-[#F9FAFB] border border-[#E8E0D5] rounded-md pl-9 pr-4 py-2 text-sm text-[#111111] placeholder:text-[#6F665B] focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C] transition-all"
          />
        </div>

        <div className="w-px h-6 bg-[#E8E0D5] hidden sm:block mx-1"></div>
        
        <Link 
          href="/" 
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#6F665B] hover:text-[#111111] transition-colors"
          title="View Storefront"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
        
        <button className="relative p-2 text-[#6F665B] hover:text-[#111111] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#C9A45C] text-black text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">3</span>
        </button>
        
        <button className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-[#6F665B] hover:text-[#111111] transition-colors">
          <Globe className="w-4 h-4" />
          <span>English</span>
        </button>
      </div>
    </header>
  );
}
