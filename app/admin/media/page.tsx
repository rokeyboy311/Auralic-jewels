'use client';

import React, { useEffect, useState } from 'react';
import { Search, Upload, Trash2, FileImage, Image as ImageIcon } from 'lucide-react';

export default function AdminMediaPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadMedia() {
      try {
        const res = await fetch('/api/admin/media');
        const data = await res.json();
        if (data.success) {
          setMedia(data.data);
        }
      } catch (error) {
        console.error('Failed to load media', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadMedia();
  }, []);

  const filteredMedia = media.filter(m => 
    m.filename?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media file? If it is used by a product, it will break the image link.')) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMedia(media.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopyLink = (base64Data: string) => {
    // In a real app we'd copy a CDN URL, here we might copy the base64 or just alert since it's inline
    navigator.clipboard.writeText(`data:image/jpeg;base64,${base64Data}`);
    alert('Image data copied to clipboard');
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-[1600px] mx-auto h-[calc(100vh-80px)] overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#111111]">Media Library</h1>
          <p className="text-sm text-[#6F665B] mt-1">Manage all product imagery, banners, and digital assets.</p>
        </div>
        <button 
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#111111] text-white text-sm font-medium rounded-md hover:bg-[#222222] transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Asset
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-[#E8E0D5] rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#E8E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F9FAFB]">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6F665B]" />
            <input 
              type="text" 
              placeholder="Search files..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8E0D5] rounded-md text-sm focus:outline-none focus:border-[#C9A45C] focus:ring-1 focus:ring-[#C9A45C]"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-6 h-6 border-2 border-[#C9A45C] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-[#6F665B] border-2 border-dashed border-[#E8E0D5] rounded-lg">
              <ImageIcon className="w-8 h-8 mb-2 text-[#E8E0D5]" />
              <p className="text-sm font-medium text-[#111111]">No media assets found.</p>
              <p className="text-xs mt-1">Upload images to see them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredMedia.map(item => (
                <div key={item.id} className="group relative bg-[#F9FAFB] rounded-lg border border-[#E8E0D5] overflow-hidden hover:shadow-md transition-shadow">
                  {/* Aspect Ratio Container for Image */}
                  <div className="aspect-square bg-gray-100 relative">
                    <img 
                      src={`data:${item.mime_type};base64,${item.data_base64}`} 
                      alt={item.filename} 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button 
                        onClick={() => handleCopyLink(item.data_base64)}
                        className="p-2 bg-white rounded-full text-[#111111] hover:text-[#C9A45C] transition-colors"
                        title="Copy Data URI"
                      >
                        <FileImage className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-white rounded-full text-[#111111] hover:text-rose-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* File Info */}
                  <div className="p-3 border-t border-[#E8E0D5]">
                    <p className="text-xs font-medium text-[#111111] truncate" title={item.filename}>
                      {item.filename}
                    </p>
                    <p className="text-[10px] text-[#6F665B] mt-1 uppercase">
                      {(item.file_size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
