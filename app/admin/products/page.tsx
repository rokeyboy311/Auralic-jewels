'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Eye, Gem } from 'lucide-react';
import { getProducts, deleteAdminProduct } from '@/lib/api';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/context/ToastContext';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { formatPrice } = useCurrency();
  const { success, error } = useToast();

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await getProducts({ limit: 100 });
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to retire "${name}" from the active catalogue?`)) return;
    
    try {
      const res = await deleteAdminProduct(id);
      if (res.success) {
        setProducts(products.filter(p => p.id !== id));
        success('Product Retired', 'The piece has been archived successfully.');
      } else {
        error('Action Failed', 'Could not delete the product.');
      }
    } catch {
      error('System Error', 'An unexpected error occurred.');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#141210] font-light">Catalogue Management</h1>
          <p className="text-xs text-[#73685a] mt-1">Manage your fine jewellery collection, pricing, and inventory.</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="px-4 py-2.5 bg-[#141210] hover:bg-[#9b7e46] text-[#faf8f5] text-xs uppercase tracking-wider font-medium flex items-center gap-2 transition-colors cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4 text-[#d4af37]" />
          <span>Add New Piece</span>
        </Link>
      </div>

      <div className="bg-white border border-[#ebdccd] rounded-sm shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#ebdccd] flex items-center justify-between bg-[#faf8f5]">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <input 
              type="text" 
              placeholder="Search by name or SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#ebdccd] rounded-sm pl-9 pr-4 py-2 text-xs text-[#141210] focus:outline-none focus:border-[#9b7e46]"
            />
          </div>
          <span className="text-[10px] text-[#73685a] uppercase tracking-wider font-medium hidden sm:block">
            {filteredProducts.length} Pieces Found
          </span>
        </div>

        <DataTable 
          data={filteredProducts}
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
          columns={[
            {
              header: 'Piece',
              cell: (p) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#faf8f5] rounded-sm border border-[#ebdccd] overflow-hidden flex-shrink-0">
                    {p.images && p.images[0] ? (
                      <img src={p.images[0].url || p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                        <Gem className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#141210]">{p.name}</span>
                    <span className="text-[10px] text-[#73685a] uppercase">{p.sku}</span>
                  </div>
                </div>
              )
            },
            {
              header: 'Category',
              cell: (p) => <span className="text-[#73685a] capitalize">{p.category.replace('cat-', '')}</span>
            },
            {
              header: 'Price',
              cell: (p) => <span className="font-semibold text-[#141210]">{formatPrice(p.priceUSD || p.price_usd)}</span>
            },
            {
              header: 'Stock',
              cell: (p) => (
                <span className={`font-medium ${p.stock < (p.lowStockThreshold || 3) ? 'text-rose-600' : 'text-[#73685a]'}`}>
                  {p.stock} units
                </span>
              )
            },
            {
              header: 'Status',
              cell: (p) => <StatusBadge status={p.status || 'active'} type="product" />
            },
            {
              header: 'Actions',
              cell: (p) => (
                <div className="flex items-center gap-2">
                  <Link href={`/product/${p.slug}`} target="_blank" className="p-1.5 text-[#9ca3af] hover:text-[#9b7e46] transition-colors" title="View on Store">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link href={`/admin/products/${p.id}`} className="p-1.5 text-[#9ca3af] hover:text-[#141210] transition-colors" title="Edit Piece">
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p.id, p.name);
                    }}
                    className="p-1.5 text-[#9ca3af] hover:text-rose-500 transition-colors" 
                    title="Delete Piece"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  );
}
