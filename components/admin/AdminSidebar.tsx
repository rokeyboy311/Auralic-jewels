'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, MessageSquare, 
  Settings, LogOut, Gem, Tag, MessageCircle, Globe, Star,
  FolderTree, Layers, Box, RotateCcw, Image as ImageIcon,
  FileText, PenTool, BarChart3, Shield, Activity, CreditCard,
  Truck, Percent, User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Define the exact grouping and routes required by the master plan
const navGroups = [
  {
    title: 'MANAGE',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
      { label: 'Products', icon: Gem, href: '/admin/products' },
      { label: 'Categories', icon: FolderTree, href: '/admin/categories' },
      { label: 'Collections', icon: Layers, href: '/admin/collections' },
      { label: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
      { label: 'Customers', icon: Users, href: '/admin/customers' },
      { label: 'Reviews', icon: Star, href: '/admin/reviews' },
      { label: 'Coupons', icon: Tag, href: '/admin/coupons' },
      { label: 'Banners', icon: ImageIcon, href: '/admin/banners' },
      { label: 'Pages', icon: FileText, href: '/admin/pages' },
      { label: 'Blog', icon: PenTool, href: '/admin/blog' },
      { label: 'Media', icon: Box, href: '/admin/media' },
      { label: 'Concierge', icon: MessageSquare, href: '/admin/conversations' },
      { label: 'Bespoke', icon: MessageCircle, href: '/admin/bespoke' },
    ]
  },
  {
    title: 'SETTINGS',
    items: [
      { label: 'Store Settings', icon: Settings, href: '/admin/settings' },
      { label: 'Shipping Methods', icon: Truck, href: '/admin/settings/shipping' },
      { label: 'Audit Logs', icon: Shield, href: '/admin/audit-logs' },
    ]
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="w-[260px] bg-[#171717] min-h-screen text-white flex flex-col fixed left-0 top-0 z-50 transition-all duration-300">
      
      {/* Brand Area */}
      <div className="h-20 flex items-center px-6 border-b border-white/5 shrink-0">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-sm border border-[#d4af37] flex items-center justify-center text-[#d4af37] transition-transform group-hover:scale-105">
            <Gem className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg tracking-wider text-white">Auralic Jewels</span>
          </div>
        </Link>
      </div>

      {/* User Profile Area */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center relative shrink-0">
          {(user as any)?.avatar_url ? (
            <img src={(user as any).avatar_url} alt={user?.name || 'Admin'} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-white/50" />
          )}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#171717] rounded-full"></span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-white truncate">{user?.name || 'Administrator'}</span>
          <span className="text-[10px] text-[#6F665B] capitalize">{user?.role?.replace('_', ' ') || 'Admin'}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={group.title} className={idx > 0 ? 'mt-6' : ''}>
            <h3 className="px-6 mb-2 text-[10px] font-semibold text-[#6F665B] tracking-wider uppercase">
              {group.title}
            </h3>
            <ul className="space-y-1 px-3">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                        isActive 
                          ? 'bg-[#d4af37] text-black font-medium shadow-sm' 
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-white/50'}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 shrink-0 mt-auto">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-all w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}
