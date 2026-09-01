'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Failed to load categories', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCategories();
  }, []);

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCategories(categories.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111]">Categories</h1>
          <p className="text-sm text-[#6F665B] mt-1">Manage product taxonomy and organization.</p>
        </div>
        <Link 
          href="/admin/categories/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#111111] text-white text-sm font-medium rounded-md hover:bg-[#222222] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Link>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-[#E8E0D5] rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E8E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F9FAFB]">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F665B]" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8E0D5] rounded-md text-sm focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-6 h-6 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#6F665B]">
              <p className="text-sm">No categories found.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F9FAFB] border-b border-[#E8E0D5] text-[#6F665B] font-medium">
                <tr>
                  <th className="px-6 py-3">Image</th>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Slug</th>
                  <th className="px-6 py-3">Products</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E0D5]">
                {filteredCategories.map(category => (
                  <tr key={category.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-md bg-[#F9FAFB] border border-[#E8E0D5] overflow-hidden">
                        {category.image_url ? (
                          <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#E8E0D5]">Img</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#111111]">{category.name}</td>
                    <td className="px-6 py-4 text-[#6F665B]">{category.slug}</td>
                    <td className="px-6 py-4 text-[#111111] font-medium">{category.itemCount || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/categories/${category.id}`} className="p-1.5 text-[#6F665B] hover:text-[#111111] hover:bg-gray-100 rounded-md transition-colors border border-[#E8E0D5]">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(category.id)} className="p-1.5 text-[#6F665B] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors border border-[#E8E0D5]">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
