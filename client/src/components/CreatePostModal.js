// client/src/components/CreatePostModal.js
'use client';

import { useState } from 'react';
import { postService } from '../services/api';

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError('Please select an image first.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('caption', caption.trim());
      formData.append('location', location.trim());

      const response = await postService.createPost(formData);
      const newPost = response?.post || response?.data || response;

      if (onPostCreated) {
        onPostCreated(newPost);
      } else {
        window.location.reload();
      }

      setCaption('');
      setLocation('');
      setImageFile(null);
      setImagePreview('');
      onClose();
    } catch (err) {
      console.error('Error creating post asset context:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload post.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-card rounded-[24px] max-w-md w-full border border-border-strong shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <header className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-base/50">
          <h3 className="text-[15px] font-bold text-text-primary uppercase tracking-wider bg-clip-text text-transparent bg-gradient-aurora">Create New Post</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-2xl font-light transition-colors">&times;</button>
        </header>

        {error && (
          <div className="mx-6 mt-5 p-4 bg-accent-like/10 border border-accent-like/20 text-accent-like text-[13px] rounded-[12px] text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* File Picker Image Frame container */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-border-strong rounded-[16px] p-4 bg-input aspect-video relative group overflow-hidden hover:border-accent-purple transition-colors">
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Upload Preview" className="w-full h-full object-cover absolute inset-0" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <label className="bg-card px-5 py-2.5 rounded-[12px] text-[13px] font-bold cursor-pointer text-text-primary hover:bg-border-subtle transition-colors shadow-lg">
                    Change Photo
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center cursor-pointer space-y-3 w-full h-full">
                <span className="text-4xl opacity-50 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-300">📸</span>
                <span className="text-[13px] text-text-secondary font-medium">Click or drag photo here</span>
                <input type="file" accept="image/*" required onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 ml-1">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows="3"
                maxLength="2200"
                className="w-full px-4 py-3 bg-input border border-border-strong rounded-[12px] text-[14px] text-text-primary focus:outline-none focus:border-accent-purple transition-colors resize-none placeholder:text-text-muted"
                placeholder="Write a caption..."
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 ml-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border-strong rounded-[12px] text-[14px] text-text-primary focus:outline-none focus:border-accent-purple transition-colors placeholder:text-text-muted"
                placeholder="Add location details..."
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-primary text-white rounded-[12px] text-[14px] font-bold disabled:opacity-50 hover:opacity-90 hover:scale-[1.02] shadow-[0_4px_14px_rgba(168,85,247,0.4)] transition-all uppercase tracking-wider"
            >
              {submitting ? 'Sharing...' : 'Share Post'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}