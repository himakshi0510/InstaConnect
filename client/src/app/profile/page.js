// client/src/app/profile/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function BaseProfileRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user?.username) {
        // Automatically drop them into their dedicated dynamic folder path
        router.replace(`/profile/${encodeURIComponent(user.username)}`);
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full" />
    </div>
  );
}