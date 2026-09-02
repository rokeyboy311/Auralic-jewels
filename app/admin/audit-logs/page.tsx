'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert,
  Search,
  Filter,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Activity,
  Globe
} from 'lucide-react';

const mockLogs = [
  { id: 'al_1', action: 'UPDATE_PRODUCT', admin: 'catherine@aurelic.com', role: 'Super Admin', resource: 'Product #P10024', ip: '192.168.1.45', timestamp: '2026-09-02T10:24:00Z', details: 'Updated price from $12,500 to $13,200' },
  { id: 'al_2', action: 'CREATE_COUPON', admin: 'marketing@aurelic.com', role: 'Admin', resource: 'Coupon VENDOME26', ip: '10.0.0.12', timestamp: '2026-09-02T09:12:00Z', details: 'Created 15% discount code' },
  { id: 'al_3', action: 'REFUND_ORDER', admin: 'catherine@aurelic.com', role: 'Super Admin', resource: 'Order #ORD-8821', ip: '192.168.1.45', timestamp: '2026-09-01T16:45:00Z', details: 'Refunded $4,200 (Bank Wire Escrow)' },
  { id: 'al_4', action: 'LOGIN_SUCCESS', admin: 'logistics@aurelic.com', role: 'Staff', resource: 'Auth System', ip: '89.123.45.67', timestamp: '2026-09-01T08:30:00Z', details: 'Successful login from Paris, FR' },
  { id: 'al_5', action: 'DELETE_CUSTOMER', admin: 'catherine@aurelic.com', role: 'Super Admin', resource: 'Customer #C9912', ip: '192.168.1.45', timestamp: '2026-08-30T14:20:00Z', details: 'GDPR right to be forgotten request' },
  { id: 'al_6', action: 'UPDATE_SHIPPING', admin: 'logistics@aurelic.com', role: 'Staff', resource: 'Shipping Settings', ip: '89.123.45.67', timestamp: '2026-08-29T11:15:00Z', details: 'Updated International Priority cost to $180' },
];

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = mockLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="inline-flex items-center gap-1 text-xs text-[#73685a] hover:text-[#141210] uppercase tracking-wider mb-2">
            <ArrowLeft className="w-3 h-3" />
            <span>Return to Dashboard</span>
          </Link>
          <h1 className="font-serif text-3xl text-[#141210] flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-[#9b7e46]" />
            Security & Audit Logs
          </h1>
          <p className="text-sm text-[#73685a] mt-1">Track staff actions, configuration changes, and system access.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 border border-[#ebdccd] flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search logs (action, admin, resource)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#c5b49e] text-sm focus:outline-none focus:border-[#9b7e46] bg-[#faf8f5]"
          />
          <Search className="w-4 h-4 text-[#73685a] absolute left-3 top-2.5" />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2 border border-[#c5b49e] text-sm hover:bg-[#faf8f5] transition-colors flex">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#ebdccd] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f2ece2] border-b border-[#ebdccd] text-[#4a4237]">
              <tr>
                <th className="px-6 py-4 font-serif font-medium">Timestamp</th>
                <th className="px-6 py-4 font-serif font-medium">Administrator</th>
                <th className="px-6 py-4 font-serif font-medium">Action</th>
                <th className="px-6 py-4 font-serif font-medium">Resource</th>
                <th className="px-6 py-4 font-serif font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebdccd]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#faf8f5] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#73685a]">
                      <Clock className="w-4 h-4" />
                      <span className="font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#9b7e46]" />
                      <div>
                        <p className="text-[#141210] font-medium">{log.admin}</p>
                        <p className="text-[10px] text-[#73685a] uppercase tracking-wider">{log.role} • {log.ip}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 bg-[#f4efe9] text-[#9b7e46] text-xs font-mono font-bold uppercase tracking-wider border border-[#e5d5c5]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#4a4237]">{log.resource}</td>
                  <td className="px-6 py-4 text-[#73685a] text-xs max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-[#ebdccd] flex items-center justify-between text-sm text-[#73685a] bg-[#faf8f5]">
          <span>Showing 1 to {filteredLogs.length} of {mockLogs.length} entries</span>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:text-[#141210] disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
            <button className="p-1 hover:text-[#141210] disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
