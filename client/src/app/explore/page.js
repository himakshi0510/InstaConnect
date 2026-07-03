// client/src/app/explore/page.js
'use client';

import { useState, useEffect } from 'react';
import { postService } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import CreatePostModal from '../../components/CreatePostModal';

export default function ExplorePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchExplorePosts = async () => {
      try {
        setLoading(true);
        const data = await postService.getExplore(1, 18); // Fetch page 1, limit to 18 posts
        
        // Extract array depending on your pagination data structure wrapper
        const exploreItems = Array.isArray(data) ? data : data?.docs || data?.posts || [];
        setPosts(exploreItems);
      } catch (err) {
        console.error('Failed to load explore feed grid:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExplorePosts();
  }, []);

  return (
    <div className="min-h-screen bg-base flex">
      <Sidebar onCreatePostClick={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-4xl mx-auto py-10 px-4">
        <header className="mb-8">
          <h1 className="text-[28px] font-bold tracking-tight text-text-primary mb-1">Explore</h1>
          <p className="text-[14px] text-text-secondary">Discover trending photos and creators across the platform</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="animate-spin h-8 w-8 border-2 border-accent-purple border-t-transparent rounded-full" />
            <p className="text-[13px] text-text-muted font-medium">Curating global grid matrix...</p>
          </div>
        ) : posts.length > 0 ? (
          /* Responsive 3-Column Instagram-Style Grid */
          <div className="grid grid-cols-3 gap-1 sm:gap-4">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="aspect-square w-full bg-card relative group overflow-hidden rounded-[8px] sm:rounded-[14px] cursor-pointer"
              >
                <img 
                  src={post.imageUrl || post.image_url} 
                  alt={post.caption || "Explore grid item"} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Dark Overlay Hover Effect displaying Metrics */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-6 text-white font-bold text-[16px] backdrop-blur-[2px]">
                  <div className="flex items-center drop-shadow-md">
                    <span>❤️</span>
                    <span className="ml-2">{post.likesCount || post.likes_count || 0}</span>
                  </div>
                  <div className="flex items-center drop-shadow-md">
                    <span>💬</span>
                    <span className="ml-2">{post.commentsCount || post.comments_count || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border-subtle p-16 rounded-[20px] text-center max-w-md mx-auto mt-12">
            <span className="text-4xl block mb-4 opacity-20">🧭</span>
            <h4 className="text-[15px] font-bold text-text-primary mb-2">Nothing to show yet</h4>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              When users start uploading pictures across the platform, they will populate this global discovery grid instantly!
            </p>
          </div>
        )}

        <CreatePostModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onPostCreated={(newPost) => setPosts((prev) => [newPost, ...prev])}
        />
      </main>
    </div>
  );
}