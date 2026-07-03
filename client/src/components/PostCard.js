// client/src/components/PostCard.js
'use client';

import { useState } from 'react';
import { postService } from '../services/api';

export default function PostCard({ post, currentUserId, onDeleteSuccess, onUpdateSuccess }) {
  const [liked, setLiked] = useState(!!post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [loadingLike, setLoadingLike] = useState(false);
  
  // Menu and Edit States
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption || '');
  const [editLocation, setEditLocation] = useState(post.location || '');
  const [isSaving, setIsSaving] = useState(false);

  // Comment States
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [showCommentsSection, setShowCommentsSection] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  // display updates
  const [displayCaption, setDisplayCaption] = useState(post.caption || '');
  const [displayLocation, setDisplayLocation] = useState(post.location || '');

  const isOwnPost = String(post.userId || post.user_id) === String(currentUserId);

  const handleLikeToggle = async () => {
    if (loadingLike) return;
    setLoadingLike(true);
    try {
      if (liked) {
        await postService.unlike(post.id);
        setLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await postService.like(post.id);
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setLoadingLike(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post permanently?')) return;
    try {
      await postService.deletePost(post.id || post._id);
      
      if (onDeleteSuccess) {
        onDeleteSuccess(post.id || post._id);
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error('Delete error context:', err);
      alert('Failed to delete post: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await postService.updatePost(post.id, {
        caption: editCaption.trim(),
        location: editLocation.trim()
      });

      const updatedPost = updated?.post || updated;

      setDisplayCaption(editCaption.trim());
      setDisplayLocation(editLocation.trim());

      setIsEditing(false);
      setShowMenu(false);
      if (onUpdateSuccess) onUpdateSuccess(updatedPost);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update post.';
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);

    try {
      const commentPayload = { body: newComment.trim() };
      const res = await postService.addComment(post.id || post._id, commentPayload);
      const freshComment = res?.comment || res?.data || res;

      const commentToAppend = {
        id: freshComment?.id || Date.now(),
        username: freshComment?.username || 'me',
        text: freshComment?.body || freshComment?.text || newComment.trim()
      };

      setComments(prev => [...prev, commentToAppend]);
      setNewComment('');

    } catch (err) {
      const serverMessage = err.response?.data?.message ||
        (err.response?.data?.errors
          ? JSON.stringify(err.response.data.errors)
          : err.message);
      alert('Could not post comment: ' + serverMessage);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    if (isNaN(diffMs)) return 'Recently';
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="bg-card border border-border-subtle rounded-[16px] overflow-hidden mb-8 max-w-[520px] mx-auto relative">
      
      {/* Header Segment */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center space-x-3">
          <div className="w-[38px] h-[38px] rounded-full p-[2px] bg-gradient-aurora">
            <div className="w-full h-full rounded-full bg-card overflow-hidden flex items-center justify-center font-bold text-xs uppercase text-text-primary">
              {post.profilePicture ? (
                <img src={post.profilePicture} alt={post.username} className="w-full h-full object-cover" />
              ) : (
                post.username?.charAt(0)
              )}
            </div>
          </div>
          <div>
            <span className="text-[14px] font-semibold text-text-primary block leading-tight tracking-wide">{post.username}</span>
            {displayLocation && <span className="text-[11px] text-accent-cyan block mt-0.5">📍 {displayLocation}</span>}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-text-muted font-medium tracking-wide uppercase">{formatTimestamp(post.createdAt || post.created_at)}</span>
          {isOwnPost && (
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="text-text-secondary hover:text-text-primary font-bold p-1 transition-colors">•••</button>
              {showMenu && (
                <div className="absolute right-0 mt-2 bg-elevated border border-border-subtle rounded-xl py-1.5 w-32 z-10 text-[13px] shadow-2xl">
                  <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-text-primary hover:bg-border-subtle transition-colors">✏️ Edit</button>
                  <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-accent-like hover:bg-accent-like/10 font-medium transition-colors">🗑️ Delete</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Form Inline Overlay */}
      {isEditing ? (
        <form onSubmit={handleUpdate} className="p-4 bg-elevated border-b border-border-subtle space-y-3 text-[13px]">
          <div>
            <label className="block font-bold text-text-secondary mb-1.5 uppercase text-[10px] tracking-wider">Edit Location</label>
            <input type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="w-full p-2.5 bg-input border border-border-strong rounded-lg text-text-primary focus:border-accent-purple focus:outline-none transition-colors" placeholder="Location details..." />
          </div>
          <div>
            <label className="block font-bold text-text-secondary mb-1.5 uppercase text-[10px] tracking-wider">Edit Caption</label>
            <textarea value={editCaption} onChange={(e) => setEditCaption(e.target.value)} rows="2" className="w-full p-2.5 bg-input border border-border-strong rounded-lg text-text-primary focus:border-accent-purple focus:outline-none transition-colors resize-none" placeholder="Write caption..." />
          </div>
          <div className="flex space-x-2 justify-end pt-2">
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-1.5 bg-border-subtle text-text-primary rounded-lg font-medium hover:bg-border-strong transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="px-4 py-1.5 bg-gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity">{isSaving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      ) : null}

      {/* Main Image Asset */}
      <div className="aspect-square w-full bg-[#050505] flex items-center justify-center">
        <img src={post.imageUrl || post.image_url} alt="Post Media" className="w-full h-full object-cover" loading="lazy" />
      </div>

      {/* Action Buttons Panel */}
      <div className="p-4 space-y-3">
        <div className="flex items-center space-x-4">
          <button onClick={handleLikeToggle} className={`text-[26px] transition-transform active:scale-125 focus:outline-none ${liked ? 'text-accent-like animate-heartBurst' : 'text-text-primary hover:text-text-secondary'}`}>
            {liked ? '❤️' : '🤍'}
          </button>
          <button onClick={() => setShowCommentsSection(!showCommentsSection)} className="text-[24px] text-text-primary hover:opacity-70 transition-opacity">
            💬
          </button>
        </div>

        <p className="text-[14px] font-bold text-text-primary">{likesCount.toLocaleString()} likes</p>

        {displayCaption && (
          <p className="text-[14px] text-text-secondary leading-relaxed">
            <span className="font-semibold text-text-primary mr-2">{post.username}</span>
            {displayCaption}
          </p>
        )}
        
        {/* Comments Section Trigger */}
        <button 
          onClick={() => setShowCommentsSection(!showCommentsSection)} 
          className="text-[13px] text-text-muted font-medium hover:text-text-primary transition-colors block pt-1"
        >
          {showCommentsSection ? 'Hide comments' : `View comments (${comments.length || post.commentsCount || 0})`}
        </button>

        {/* Dynamic Interactive Comments Block */}
        {showCommentsSection && (
          <div className="border-t border-border-subtle pt-3 mt-3 space-y-3 max-h-48 overflow-y-auto pr-1">
            {comments.map((c, idx) => (
              <div key={c.id || idx} className="text-[13px] text-text-secondary">
                <span className="font-semibold mr-2 text-text-primary">{c.username || 'user'}</span>
                <span>{c.text || c.content || c.body}</span>
              </div>
            ))}
            
            <form onSubmit={handleAddComment} className="flex gap-2 pt-3 border-t border-border-subtle mt-2">
              <input 
                type="text" 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                placeholder="Add a comment..." 
                className="flex-1 px-3 py-1.5 text-[13px] bg-input border border-border-subtle text-text-primary rounded-full focus:outline-none focus:border-accent-purple transition-colors"
              />
              <button 
                type="submit" 
                disabled={submittingComment || !newComment.trim()} 
                className="text-[14px] font-bold text-accent-cyan hover:text-white transition-colors disabled:opacity-50 px-1"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}