'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { WorkshopStaff } from '@/lib/types';

interface AdminStaffTabProps {
  staffList: WorkshopStaff[];
}

export default function AdminStaffTab({ staffList }: AdminStaffTabProps) {
  return (
    <div className="bg-white border border-[#ebdccd] overflow-hidden">
      <div className="p-4 border-b border-[#ebdccd] flex justify-between items-center bg-[#faf8f5]">
        <div>
          <h3 className="font-serif text-lg text-[#141210]">Workshop Staff & Master Jewellers Directory</h3>
          <p className="text-xs text-[#73685a]">
            Internal staff accounts managed strictly within the admin architecture.
          </p>
        </div>
        <span className="px-3 py-1 bg-[#141210] text-[#faf8f5] text-xs font-mono">
          {staffList.length} Active Staff Members
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#141210]">
          <thead className="bg-[#f5ede3] text-[#73685a] uppercase text-[10px] tracking-wider border-b border-[#ebdccd]">
            <tr>
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Internal Role</th>
              <th className="py-3 px-4">Specialty & Department</th>
              <th className="py-3 px-4">Active Inquiries Assigned</th>
              <th className="py-3 px-4">Access Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebdccd]">
            {staffList.map((stf) => (
              <tr key={stf.id} className="hover:bg-[#faf8f5]">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#141210] text-[#dfd0b5] flex items-center justify-center font-serif text-sm font-bold">
                      {stf.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-serif text-sm text-[#141210] font-medium">{stf.name}</p>
                      <p className="text-[11px] text-[#73685a] font-mono">{stf.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="px-2 py-0.5 bg-[#f2ece2] text-[#9b7e46] font-mono text-[10px] uppercase font-bold border border-[#ebdccd]">
                    {stf.role.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-4 px-4 text-[#594f43]">
                  {stf.specialty || 'Haute Joaillerie Execution'}
                </td>
                <td className="py-4 px-4 font-mono font-medium">
                  {stf.activeTicketsCount || 2} active tickets
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Node</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
