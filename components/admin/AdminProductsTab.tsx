'use client';

import React from 'react';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCurrency } from '@/context/CurrencyContext';

interface AdminProductsTabProps {
  products: Product[];
  onDeleteProduct: (id: string) => void;
}

export default function AdminProductsTab({ products, onDeleteProduct }: AdminProductsTabProps) {
  const { formatPrice } = useCurrency();

  return (
    <div className="bg-white border border-[#ebdccd] overflow-hidden">
      <div className="p-4 border-b border-[#ebdccd] flex justify-between items-center bg-[#faf8f5]">
        <h3 className="font-serif text-lg text-[#141210]">Fine Jewellery Inventory & Gemological Dossiers</h3>
        <span className="text-xs text-[#73685a]">{products.length} Active Items</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#141210]">
          <thead className="bg-[#f5ede3] text-[#73685a] uppercase text-[10px] tracking-wider border-b border-[#ebdccd]">
            <tr>
              <th className="py-3 px-4">Piece</th>
              <th className="py-3 px-4">Category & SKU</th>
              <th className="py-3 px-4">Metal & Gold Purity</th>
              <th className="py-3 px-4">Gemstone / GIA Certificate</th>
              <th className="py-3 px-4">Gross Wt</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ebdccd]/60">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-[#faf8f5]/80 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 relative bg-[#f5ede3] shrink-0 border border-[#ebdccd]">
                      <Image
                        src={p.images[0]?.url || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80'}
                        alt={p.name}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="font-serif text-sm font-medium text-[#141210]">{p.name}</p>
                      <p className="text-[10px] text-[#73685a]">{p.countryOfOrigin}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px]">
                  <div>{p.category}</div>
                  <div className="text-[10px] text-[#73685a]">{p.sku}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-medium">{p.metalType}</div>
                  <div className="text-[10px] text-[#9b7e46]">{p.purity}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-medium">{p.stoneType} ({p.stoneWeightCarats || 0}ct)</div>
                  <div className="text-[10px] text-[#73685a]">
                    {p.certification?.certificateNumber || 'Atelier Hallmark'}
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px]">
                  {p.grossWeightGrams}g
                </td>
                <td className="py-3.5 px-4 font-serif text-sm font-medium">
                  {formatPrice(p.priceUSD)}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-semibold ${
                      p.stock <= 2 ? 'bg-red-100 text-red-800' : 'bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    {p.stock} in stock
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onDeleteProduct(p.id)}
                    className="p-1.5 text-[#998b79] hover:text-red-700 transition-colors cursor-pointer"
                    title="Retire Piece"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
