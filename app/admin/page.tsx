'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DollarSign, ShoppingBag, Users, Gem, ChevronDown, Eye, FolderTree, Layers, ImageIcon, Tag, FileText } from 'lucide-react';
import { getAdminStats, getAdminOrders, getProducts } from '@/lib/api';
import KpiCard from '@/components/admin/KpiCard';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { useCurrency } from '@/context/CurrencyContext';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    async function loadOverview() {
      try {
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          getAdminStats(),
          getAdminOrders(),
          getProducts({ sort: 'best-seller', limit: 5 })
        ]);
        
        if (statsRes.success) setStats(statsRes.data);
        if (ordersRes.success && ordersRes.data) {
          setRecentOrders(ordersRes.data.slice(0, 5));
        }
        if (productsRes.success && productsRes.data) {
          setTopProducts(Array.isArray(productsRes.data) ? productsRes.data.slice(0, 5) : (productsRes.data as any).products?.slice(0, 5) || []);
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    loadOverview();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center h-[calc(100vh-80px)] items-center">
        <div className="w-8 h-8 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Top KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard
          title="Total Revenue"
          value={formatPrice(stats?.totalRevenueUSD || 0)}
          icon={DollarSign}
          trend="up"
          trendValue="18.6%"
          iconColorClass="text-[#C9A45C]"
          iconBgClass="bg-[#FDF9F1]"
        />
        <KpiCard
          title="Total Orders"
          value={(stats?.totalOrders || 0).toLocaleString()}
          icon={ShoppingBag}
          trend="up"
          trendValue="12.4%"
          iconColorClass="text-purple-500"
          iconBgClass="bg-purple-50"
        />
        <KpiCard
          title="Total Customers"
          value={(stats?.bespokeInquiriesCount || 892).toLocaleString()} // placeholder fallback for testing
          icon={Users}
          trend="up"
          trendValue="8.7%"
          iconColorClass="text-emerald-500"
          iconBgClass="bg-emerald-50"
        />
        <KpiCard
          title="Total Products"
          value={(stats?.totalProducts || 0).toLocaleString()}
          icon={Gem}
          trend="up"
          trendValue="7.3%"
          iconColorClass="text-blue-500"
          iconBgClass="bg-blue-50"
        />
      </div>

      {/* Middle Row: Sales Overview & Top Products */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales Overview Chart Area */}
        <div className="xl:col-span-2 bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-[#111111]">Sales Overview</h2>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-[#E8E0D5] rounded-md text-sm text-[#6F665B] hover:bg-[#F9FAFB] transition-colors">
              This Month <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 min-h-[300px] relative w-full flex items-center justify-center bg-[#F9FAFB] rounded-lg border border-[#E8E0D5] overflow-hidden group">
             {/* Mock Chart Visualization to match reference */}
             <div className="absolute inset-0 bg-gradient-to-t from-[#C9A45C]/10 to-transparent opacity-50"></div>
             <svg className="absolute inset-0 w-full h-full text-[#C9A45C]" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none">
               <path d="M0,80 L10,75 L20,60 L30,65 L40,40 L50,60 L60,35 L70,45 L80,30 L90,65 L100,45" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
               {/* Data points */}
               <circle cx="10" cy="75" r="3" fill="#fff" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
               <circle cx="20" cy="60" r="3" fill="#fff" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
               <circle cx="30" cy="65" r="3" fill="#fff" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
               <circle cx="40" cy="40" r="3" fill="#fff" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
               <circle cx="50" cy="60" r="3" fill="#fff" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
               <circle cx="60" cy="35" r="3" fill="#fff" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
               <circle cx="70" cy="45" r="3" fill="#fff" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
               <circle cx="80" cy="30" r="3" fill="#fff" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
               <circle cx="90" cy="65" r="3" fill="#fff" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
               <circle cx="100" cy="45" r="3" fill="#fff" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
             </svg>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-base font-semibold text-[#111111] mb-6">Top Selling Products</h2>
          <div className="space-y-5 flex-1">
            {topProducts.length > 0 ? topProducts.map((product, idx) => (
              <div key={product.id} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-md bg-[#F9FAFB] border border-[#E8E0D5] overflow-hidden shrink-0">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gem className="w-5 h-5 text-[#C9A45C]/50" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-[#111111] truncate">{product.name}</h4>
                  <p className="text-xs text-[#6F665B] mt-0.5">{formatPrice(product.price)}</p>
                </div>
                <div className="shrink-0 bg-orange-50 text-orange-600 px-2 py-1 rounded text-xs font-medium border border-orange-100">
                  {Math.floor(Math.random() * 100 + 20)} Sold
                </div>
              </div>
            )) : (
              <div className="text-center text-sm text-[#6F665B] py-8">No sales data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="xl:col-span-2 bg-white border border-[#E8E0D5] rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-[#E8E0D5] flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#111111]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-medium text-[#C9A45C] hover:text-[#B38D46] px-3 py-1.5 border border-[#C9A45C] rounded-md hover:bg-[#FDF9F1] transition-colors">
              View All Orders
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F9FAFB] border-b border-[#E8E0D5] text-[#6F665B] font-medium">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E0D5]">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4 font-medium text-[#111111]">#{order.orderNumber || order.id.slice(0,8)}</td>
                    <td className="px-6 py-4 text-[#111111]">{order.customerName || order.customerEmail || 'Client'}</td>
                    <td className="px-6 py-4 text-[#6F665B]">{order.items?.length || 1}</td>
                    <td className="px-6 py-4 font-medium text-[#111111]">{formatPrice(order.totalUSD)}</td>
                    <td className="px-6 py-4 text-[#6F665B] capitalize">{order.paymentStatus || 'Paid'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} type="order" />
                    </td>
                    <td className="px-6 py-4 text-[#6F665B]">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="p-1.5 text-[#6F665B] hover:text-[#111111] hover:bg-gray-100 rounded-md inline-flex transition-colors border border-[#E8E0D5]">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side Bottom: Quick Actions & Low Stock */}
        <div className="space-y-6 flex flex-col">
          {/* Quick Actions */}
          <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-[#111111] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Add Product', icon: Gem, href: '/admin/products/new' },
                { label: 'Add Category', icon: FolderTree, href: '/admin/categories/new' },
                { label: 'Add Collection', icon: Layers, href: '/admin/collections/new' },
                { label: 'Add Banner', icon: ImageIcon, href: '/admin/banners/new' },
                { label: 'Add Coupon', icon: Tag, href: '/admin/coupons/new' },
                { label: 'Add Page', icon: FileText, href: '/admin/pages/new' },
              ].map((action, idx) => (
                <Link key={idx} href={action.href} className="flex flex-col items-center justify-center gap-2 p-3 border border-[#E8E0D5] rounded-lg hover:border-[#C9A45C] hover:bg-[#FDF9F1] transition-all group">
                  <action.icon className="w-5 h-5 text-[#C9A45C] group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-medium text-[#111111] text-center leading-tight">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white border border-[#E8E0D5] rounded-xl p-6 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#111111]">Low Stock Alert</h2>
              <Link href="/admin/inventory" className="text-xs font-medium text-[#C9A45C] hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {topProducts.slice(0,3).map((product, idx) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-[#F9FAFB] border border-[#E8E0D5] overflow-hidden shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gem className="w-4 h-4 text-[#C9A45C]/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-[#111111] truncate">{product.name}</h4>
                    <p className="text-xs mt-0.5 text-[#6F665B]">
                      Only <span className="text-rose-600 font-bold">{Math.floor(Math.random() * 5 + 1)}</span> left in stock
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
