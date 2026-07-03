// client/src/components/Sidebar.js
'use client';

import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ onCreatePostClick }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const menuItems = [
    { label: 'Home', path: '/', icon: '🏠' },
    { label: 'Explore', path: '/explore', icon: '🧭' },
    { label: 'Search', path: '/search', icon: '🔍' },
    { label: 'Profile', path: `/profile/${user?.username}`, icon: '👤', dynamic: true },
  ];

  return (
    <div className="hidden lg:flex w-[260px] h-screen sticky top-0 left-0 bg-[#0D0D0D] border-r border-[#1E1E1E] p-5 flex-col justify-between select-none">
      <div className="space-y-8">
        {/* Platform Brand Logo */}
        <div className="mb-[32px] px-2">
          <Link href="/" className="text-[26px] font-extrabold tracking-tight bg-gradient-aurora-text">
            InstaConnect
          </Link>
        </div>

        {/* Action Menu List */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const targetPath = item.dynamic && user ? `/profile/${user.username}` : item.path;
            const isActive = pathname === targetPath;

            return (
              <Link
                key={item.label}
                href={targetPath}
                className={`flex items-center h-[52px] rounded-[14px] px-4 font-medium text-[15px] transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-accent-purple/10 to-accent-cyan/10 border-l-[3px] border-accent-purple text-transparent bg-clip-text bg-gradient-aurora'
                    : 'text-text-secondary hover:bg-elevated hover:text-text-primary'
                }`}
              >
                <span className={`text-[22px] mr-[14px] ${isActive ? 'text-accent-purple' : 'text-text-muted hover:text-text-primary transition-colors'}`}>
                  {item.icon}
                </span>
                <span className={isActive ? 'bg-gradient-aurora-text' : ''}>{item.label}</span>
              </Link>
            );
          })}

          {/* Create Post Interactive Callout Button */}
          <button
            onClick={onCreatePostClick}
            className="w-full flex items-center justify-center space-x-2 h-[48px] mt-4 rounded-[14px] font-semibold text-[15px] text-white bg-gradient-primary hover:opacity-90 hover:scale-[1.01] hover:shadow-[0_4px_20px_rgba(168,85,247,0.4)] active:scale-95 transition-all duration-200"
          >
            <span className="text-[18px] leading-none">➕</span>
            <span>New Post</span>
          </button>
        </nav>
      </div>

      {/* Footer / Account Actions session controls */}
      <div className="border-t border-[#1E1E1E] pt-4 mt-4">
        {user && (
          <div className="flex items-center space-x-3 mb-2 p-2 rounded-[12px] hover:bg-elevated transition-colors cursor-pointer group">
            <div className="w-[36px] h-[36px] rounded-full bg-input overflow-hidden flex flex-shrink-0 items-center justify-center text-sm font-bold border border-border-subtle group-hover:border-accent-purple transition-colors">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                user.username?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="truncate flex-1">
              <p className="text-[14px] font-semibold text-text-primary truncate">{user.fullName}</p>
              <p className="text-[12px] text-text-secondary truncate">@{user.username}</p>
            </div>
            <div className="text-text-muted group-hover:text-text-primary px-1">...</div>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full text-left text-[13px] font-semibold text-accent-like hover:bg-accent-like/10 px-3 py-2.5 rounded-[10px] transition-all duration-200"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}