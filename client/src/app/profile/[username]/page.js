// client/src/app/profile/[username]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { userService, postService } from '../../../services/api';
import Sidebar from '../../../components/Sidebar';
import CreatePostModal from '../../../components/CreatePostModal';
import EditProfileModal from '../../../components/EditProfileModal';

export default function ProfilePage({ params }) {
  const profileUsername = decodeURIComponent(params.username);
  const { user: currentUser, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    const fetchProfileDashboard = async () => {
      try {
        setLoading(true);
        const data = await userService.getProfile(profileUsername);
        
        const extractedData = data?.user || data?.profile || data;
        setProfileData(extractedData);
        setIsFollowing(!!extractedData?.isFollowing);
        setFollowersCount(extractedData?.followersCount || 0);

        const postsData = await userService.getUserPosts(profileUsername);
        const postsArray = Array.isArray(postsData) ? postsData : postsData?.posts || [];
        setUserPosts(postsArray);

      } catch (err) {
        console.error('Failed to resolve profile matrix:', err);
      } finally {
        setLoading(false);
      }
    };

    if (profileUsername) {
      fetchProfileDashboard();
    }
  }, [profileUsername, currentUser]);

  const displayUsername = profileData?.username || profileUsername;
  const displayFullName = profileData?.fullName || profileData?.fullname || "InstaConnect User";
  const displayBio = profileData?.bio || "No profile bio description provided yet.";
  
  const isOwnProfile = currentUser?.username?.toLowerCase() === displayUsername?.toLowerCase();

  const handleFollowToggle = async () => {
    if (!profileData?.id) return;
    try {
      if (isFollowing) {
        await userService.unfollowUser(profileData.id);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await userService.followUser(profileData.id);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-base flex">
      <Sidebar onCreatePostClick={() => setIsModalOpen(true)} />

      <main className="flex-1 max-w-4xl mx-auto py-10 px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-3">
            <div className="animate-spin h-8 w-8 border-2 border-accent-purple border-t-transparent rounded-full" />
            <p className="text-[13px] text-text-muted font-medium">Loading profile summary...</p>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-14 border-b border-border-subtle pb-10">
              
              {/* Profile Avatar */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-aurora shrink-0">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-4xl font-bold uppercase text-text-secondary overflow-hidden">
                  {profileData?.profilePicture ? (
                    <img src={profileData.profilePicture} alt={displayUsername} className="w-full h-full object-cover" />
                  ) : (
                    displayUsername.charAt(0)
                  )}
                </div>
              </div>

              {/* Data Layout Segment */}
              <div className="flex-1 space-y-6 w-full text-center sm:text-left">
                
                {/* 1. Identity Layout Block (Top) */}
                <div className="space-y-2">
                  <h2 className="text-[28px] font-medium text-text-primary tracking-tight">@{displayUsername}</h2>
                  <h1 className="text-[15px] font-bold text-text-primary">{displayFullName}</h1>
                  <p className="text-[14px] text-text-secondary max-w-md leading-relaxed mx-auto sm:mx-0 whitespace-pre-wrap">
                    {displayBio}
                  </p>
                </div>

                {/* 2. Metrics Counter Stats Row (Middle) */}
                <div className="flex justify-center sm:justify-start space-x-10 text-[15px] pt-1">
                  <div>
                    <span className="font-bold text-text-primary mr-1.5">{userPosts.length}</span> 
                    <span className="text-text-muted">posts</span>
                  </div>
                  <div>
                    <span className="font-bold text-text-primary mr-1.5">{followersCount}</span>
                    <span className="text-text-muted">followers</span>
                  </div>
                  <div>
                    <span className="font-bold text-text-primary mr-1.5">{profileData?.followingCount || profileData?.following?.length || 0}</span> 
                    <span className="text-text-muted">following</span>
                  </div>
                </div>

                {/* 3. Action Control Button Row (Bottom) */}
                <div className="pt-3">
                  {isOwnProfile ? (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="w-full sm:w-64 py-2 bg-elevated border border-border-strong rounded-[10px] text-[14px] font-semibold text-text-primary hover:bg-border-subtle transition-colors"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      onClick={handleFollowToggle}
                      className={`w-full sm:w-64 py-2 rounded-[10px] text-[14px] font-semibold transition-all ${
                        isFollowing
                          ? 'bg-elevated border border-border-strong text-text-primary hover:border-accent-like hover:text-accent-like'
                          : 'bg-gradient-primary text-white hover:opacity-90 hover:scale-[1.02] shadow-[0_4px_14px_rgba(168,85,247,0.4)]'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )} 
                </div>

              </div>
            </div>

            {/* Post Thumbnail Matrix */}
            {userPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 sm:gap-4">
                {userPosts.map((post) => (
                  <div key={post.id} className="aspect-square bg-card relative group overflow-hidden rounded-[8px] sm:rounded-[14px] cursor-pointer">
                    <img src={post.imageUrl || post.image_url} alt="Gallery item" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-6 text-white font-bold text-[16px] backdrop-blur-[2px]">
                      <span className="flex items-center drop-shadow-md">❤️ <span className="ml-2">{post.likesCount || 0}</span></span>
                      <span className="flex items-center drop-shadow-md">💬 <span className="ml-2">{post.commentsCount || 0}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-card rounded-[20px] border border-dashed border-border-strong max-w-md mx-auto">
                <span className="text-4xl block mb-4 opacity-20">📸</span>
                <p className="text-[14px] text-text-muted font-medium">No posts shared yet.</p>
              </div>
            )}

          </div>
        )}

        <CreatePostModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onPostCreated={(newPost) => setUserPosts(prev => [newPost, ...prev])}
        />

        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentProfile={profileData}
          onUpdateSuccess={(updatedData) => {
            setProfileData(updatedData);
            if (isOwnProfile) updateUser(updatedData);
          }}
        />
      </main>
    </div>
  );
} 