// client/src/components/EditProfileModal.js
'use client';

import { useState, useRef } from 'react';
import { userService } from '../services/api';

export default function EditProfileModal({ isOpen, onClose, currentProfile, onUpdateSuccess }) {
  const [fullName, setFullName] = useState(currentProfile?.fullName || currentProfile?.fullname || '');
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(currentProfile?.profilePicture || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Client-side thumbnail preview temporary container
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('bio', bio);

      if (imageFile) {
        formData.append('profilePicture', imageFile);
      }

      const updatedUser = await userService.updateProfile(formData);

      // Extract the returned user object from whatever shape the API returns
      const latestData = updatedUser?.user || updatedUser?.profile || updatedUser;

      // Merge with existing profile so NO fields become undefined
      const mergedData = { ...currentProfile, ...latestData };

      // Write the complete merged object to localStorage
      localStorage.setItem('user', JSON.stringify(mergedData));

      // Call parent updater exactly ONCE with the complete merged data
      onUpdateSuccess(mergedData);

      // Close modal exactly ONCE
      onClose();

    } catch (err) {
      console.log('Server Error Detail:', err.response?.data);
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-card rounded-[24px] max-w-md w-full border border-border-strong shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <header className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-base/50">
          <h3 className="text-[15px] font-bold text-text-primary uppercase tracking-wider bg-clip-text text-transparent bg-gradient-aurora">Edit Profile</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-2xl font-light transition-colors">&times;</button>
        </header>

        {error && (
          <div className="mx-6 mt-5 p-4 bg-accent-like/10 border border-accent-like/20 text-accent-like text-[13px] rounded-[12px] text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Profile Picture Upload Control Block */}
          <div className="flex flex-col items-center space-y-4 border-b border-border-subtle pb-6">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-aurora shrink-0 shadow-lg relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-full h-full rounded-full bg-card overflow-hidden flex items-center justify-center text-3xl font-bold uppercase text-text-muted">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                ) : (
                  fullName.charAt(0) || "U"
                )}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-10 pointer-events-none">
                <span className="text-white text-[12px] font-bold drop-shadow-md">Change</span>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="text-[13px] font-bold text-accent-cyan hover:text-white transition-colors"
            >
              Change Profile Photo
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 ml-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border-strong rounded-[12px] text-[14px] text-text-primary focus:outline-none focus:border-accent-purple transition-colors placeholder:text-text-muted"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 ml-1">Bio / Description</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="3"
                maxLength="150"
                className="w-full px-4 py-3 bg-input border border-border-strong rounded-[12px] text-[14px] text-text-primary focus:outline-none focus:border-accent-purple transition-colors resize-none placeholder:text-text-muted"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-elevated border border-border-strong text-text-primary rounded-[12px] text-[14px] font-semibold hover:bg-border-subtle transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-3.5 bg-gradient-primary text-white rounded-[12px] text-[14px] font-bold disabled:opacity-50 hover:opacity-90 hover:scale-[1.02] shadow-[0_4px_14px_rgba(168,85,247,0.4)] transition-all">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}