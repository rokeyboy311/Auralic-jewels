'use client';

import React, { useEffect, useState } from 'react';
import { Search, Star, Trash2, CheckCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await fetch('/api/admin/reviews');
        const data = await res.json();
        if (data.success) {
          setReviews(data.data);
        }
      } catch (error) {
        console.error('Failed to load reviews', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadReviews();
  }, []);

  const filteredReviews = reviews.filter(r => 
    r.user_name?.toLowerCase().includes(search.toLowerCase()) || 
    r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setReviews(reviews.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-[#C9A45C]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`w-3.5 h-3.5 ${star <= rating ? 'fill-current' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111]">Reviews & Testimonials</h1>
          <p className="text-sm text-[#6F665B] mt-1">Monitor client feedback and moderate product reviews.</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-[#E8E0D5] rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E8E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F9FAFB]">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F665B]" />
            <input 
              type="text" 
              placeholder="Search reviews..." 
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
          ) : filteredReviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#6F665B]">
              <p className="text-sm">No reviews found.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F9FAFB] border-b border-[#E8E0D5] text-[#6F665B] font-medium">
                <tr>
                  <th className="px-6 py-3">Rating</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Review</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E0D5]">
                {filteredReviews.map(review => (
                  <tr key={review.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4">
                      {renderStars(review.rating)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#111111]">{review.user_name}</div>
                      {review.is_verified_buyer && (
                        <div className="flex items-center gap-1 text-emerald-600 text-xs mt-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified Buyer
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {review.product_name ? (
                        <Link href={`/admin/products/${review.product_id}`} className="flex items-center gap-3 group">
                          <div className="w-10 h-10 rounded-md bg-[#F9FAFB] border border-[#E8E0D5] overflow-hidden shrink-0">
                            {review.product_image ? (
                              <img src={review.product_image} alt={review.product_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#E8E0D5]">Img</div>
                            )}
                          </div>
                          <span className="font-medium text-[#111111] group-hover:text-[#C9A45C] transition-colors truncate max-w-[200px]">
                            {review.product_name}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-[#6F665B]">Product deleted</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-normal min-w-[300px]">
                      <div className="font-medium text-[#111111] mb-1">{review.title}</div>
                      <p className="text-[#6F665B] text-sm line-clamp-2">{review.comment}</p>
                    </td>
                    <td className="px-6 py-4 text-[#6F665B]">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(review.id)} className="p-1.5 text-[#6F665B] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors border border-[#E8E0D5]">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
