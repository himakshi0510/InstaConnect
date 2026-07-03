// client/src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/api';
import Sidebar from '../components/Sidebar';
import CreatePostModal from '../components/CreatePostModal';
import PostCard from '../components/PostCard';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedLoading, setFeedLoading] = useState(true);

  const fetchTimelineFeed = async () => {
    try {
      setFeedLoading(true);
      const data = await postService.getFeed();
      // Handle array unpacking depending on cursor-pagination structures safely
      const items = Array.isArray(data) ? data : data?.posts || [];
      setPosts(items);
    } catch (err) {
      console.error('Failed to load feed stream items:', err);
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTimelineFeed();
    }
  }, [user]);

  // prepend newly uploaded items instantly to the feed view window
  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="animate-spin h-10 w-10 border-4 border-accent-purple border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base flex">
      <Sidebar onCreatePostClick={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-xl mx-auto py-10 px-4">
        <header className="border-b border-border-subtle pb-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-text-primary mb-1">Home Feed</h1>
            <p className="text-[14px] text-text-secondary">Welcome, {user?.fullName || user?.username}!</p>
          </div>
        </header>

        {feedLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="animate-spin h-8 w-8 border-2 border-accent-cyan border-t-transparent rounded-full" />
            <p className="text-[13px] text-text-muted font-medium">Assembling your stream...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((postItem) => (
              <PostCard 
                key={postItem.id} 
                post={postItem} 
                currentUserId={user?.id}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border-strong p-16 rounded-[24px] text-center max-w-xl mx-auto shadow-lg relative overflow-hidden">
            {/* Ambient background effect for empty state */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 rounded-full blur-[50px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-cyan/5 rounded-full blur-[50px] pointer-events-none" />
            
            <div className="relative z-10">
              <span className="text-4xl block mb-4 opacity-40">✨</span>
              <h4 className="text-[16px] font-bold text-text-primary mb-2">Your stream is currently empty</h4>
              <p className="text-[14px] text-text-secondary max-w-xs mx-auto mb-8 leading-relaxed">
                Create your very first media post or follow alternative users to build your timeline.
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="text-[14px] bg-gradient-primary hover:opacity-90 hover:scale-[1.02] hover:shadow-[0_4px_14px_rgba(168,85,247,0.4)] text-white font-bold px-6 py-3 rounded-[12px] transition-all"
              >
                Share your first photo
              </button>
            </div>
          </div>
        )}

        <CreatePostModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onPostCreated={handlePostCreated}
        />
      </main>
    </div>
  );
}