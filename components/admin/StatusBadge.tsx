'use client';

import React from 'react';
import { CheckCircle2, Clock, Truck, XCircle, Package, RefreshCw } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'product' | 'bespoke' | 'conversation';
}

export default function StatusBadge({ status, type = 'order' }: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase().trim();

  let styles = 'bg-gray-100 text-gray-700 border-gray-200';
  let Icon = Package;
  let label = status;

  if (type === 'order') {
    switch (normalized) {
      case 'pending':
        styles = 'bg-amber-50 text-amber-700 border-amber-200';
        Icon = Clock;
        label = 'Pending Review';
        break;
      case 'processing':
      case 'in_production':
        styles = 'bg-blue-50 text-blue-700 border-blue-200';
        Icon = RefreshCw;
        label = 'In Production';
        break;
      case 'shipped':
      case 'dispatched':
        styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        Icon = Truck;
        label = 'Dispatched';
        break;
      case 'delivered':
        styles = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        Icon = CheckCircle2;
        label = 'Delivered';
        break;
      case 'cancelled':
        styles = 'bg-rose-50 text-rose-700 border-rose-200';
        Icon = XCircle;
        label = 'Cancelled';
        break;
    }
  } else if (type === 'product') {
    switch (normalized) {
      case 'active':
        styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        Icon = CheckCircle2;
        label = 'Active';
        break;
      case 'draft':
        styles = 'bg-gray-50 text-gray-600 border-gray-200';
        Icon = Clock;
        label = 'Draft';
        break;
    }
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold border ${styles}`}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </span>
  );
}
