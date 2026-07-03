'use client';

import { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import CreatePostModal from '../../components/CreatePostModal';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async (searchQuery) => {
    try {
      setLoading(true);
      const data = await userService.searchUsers(searchQuery);
      
      const items = Array.isArray(data) ? data : data?.users || data?.data || [];
      setResults(items);
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base flex">
      <Sidebar onCreatePostClick={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-2xl mx-auto py-10 px-4">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-6">Search</h1>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search for users..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-input border border-border-strong rounded-xl focus:outline-none focus:border-accent-purple text-text-primary placeholder:text-text-muted transition-all"
              autoFocus
            />
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <div className="animate-spin h-8 w-8 border-2 border-accent-purple border-t-transparent rounded-full" />
            <p className="text-[13px] text-text-muted font-medium">Searching network...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            {results.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.username}`}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border-subtle hover:border-accent-purple/50 transition-colors group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-[48px] h-[48px] rounded-full p-[2px] bg-gradient-aurora">
                    <div className="w-full h-full rounded-full bg-card overflow-hidden flex items-center justify-center font-bold text-text-secondary">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        user.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-[15px] group-hover:text-accent-cyan transition-colors">{user.username}</h3>
                    <p className="text-[13px] text-text-secondary">{user.fullName}</p>
                  </div>
                </div>
                <button className="px-5 py-2 bg-border-subtle text-text-primary text-[13px] font-semibold rounded-[10px] group-hover:bg-accent-purple group-hover:text-white transition-all">
                  View
                </button>
              </Link>
            ))}
          </div>
        ) : query.trim() ? (
          <div className="text-center py-16 text-text-muted text-[14px]">
            No users found matching "{query}"
          </div>
        ) : (
          <div className="text-center py-16 text-text-muted text-[14px] flex flex-col items-center">
            <span className="text-4xl mb-3 opacity-20">🧭</span>
            <span>Enter a username or name to search</span>
          </div>
        )}

        <CreatePostModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </main>
    </div>
  );
}
