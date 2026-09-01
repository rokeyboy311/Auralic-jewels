'use client';

import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  iconColorClass?: string;
  iconBgClass?: string;
}

export default function KpiCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  iconColorClass = 'text-[#C9A45C]',
  iconBgClass = 'bg-[#F9F5EC]'
}: KpiCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-[#E8E0D5] shadow-sm flex flex-col justify-between h-full">
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <h3 className="text-[#6F665B] text-sm font-medium">{title}</h3>
          <p className="text-2xl font-bold text-[#111111] tracking-tight">{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBgClass} rounded-full flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColorClass}`} strokeWidth={2.5} />
        </div>
      </div>
      
      {(trend && trendValue) && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
          {trend === 'up' && (
            <span className="flex items-center text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              {trendValue}
            </span>
          )}
          {trend === 'down' && (
            <span className="flex items-center text-rose-600">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {trendValue}
            </span>
          )}
          <span className="text-[#6F665B] font-normal">{subtitle || 'from last month'}</span>
        </div>
      )}
    </div>
  );
}
