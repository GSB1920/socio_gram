import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Search, Compass, Clapperboard, MessageCircle, Heart, PlusSquare, Menu, FileText, Video, Image as ImageIcon, Camera, Settings, Activity, Bookmark, Moon, MessageSquareWarning, Repeat, LogOut } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import SearchDrawer from './SearchDrawer';

export default function Sidebar({ onCreateClick }) {
  const { user, logout } = useUser();
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const expanded = isHovered && !isSearchOpen; // Don't expand on hover if search is open

  // Helper to ensure icons have consistent stroke width
  const IconWrapper = ({ Icon, ...props }) => <Icon strokeWidth={2} {...props} />;

  const navItems = [
    { icon: Home, label: 'Home', href: '/', onClick: () => setIsSearchOpen(false) },
    { icon: Search, label: 'Search', onClick: () => setIsSearchOpen(!isSearchOpen) },
    { icon: Compass, label: 'Explore', href: '/explore', onClick: () => setIsSearchOpen(false) },
    { icon: Clapperboard, label: 'Reels', href: '/reels', onClick: () => setIsSearchOpen(false) },
    { icon: MessageCircle, label: 'Messages', href: '/messages', onClick: () => setIsSearchOpen(false) },
    { icon: Heart, label: 'Notifications', href: '/notifications', onClick: () => setIsSearchOpen(false) },
  ];

  const handleCreateClick = () => {
    setShowCreateMenu(!showCreateMenu);
    setShowMoreMenu(false);
    setIsSearchOpen(false);
  };

  const handleMoreClick = () => {
    setShowMoreMenu(!showMoreMenu);
    setShowCreateMenu(false);
    setIsSearchOpen(false);
  };

  return (
    <>
      <div 
        className={`fixed left-0 top-0 h-full border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex flex-col z-50 transition-all duration-300 ease-in-out ${expanded ? 'w-[245px] px-3' : 'w-[72px] px-3 items-center'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo */}
        <div className={`mt-8 mb-8 ${expanded ? 'px-3' : 'px-0'} transition-all duration-300`}>
          {expanded ? (
            <h1 className="text-2xl font-bold italic whitespace-nowrap" style={{ fontFamily: 'cursive' }}>
              Socio Gram
            </h1>
          ) : (
            <Camera className="w-8 h-8 text-black dark:text-white" />
          )}
        </div>

        {/* Navigation - Centered Vertically */}
        <div className="flex-1 flex flex-col justify-center w-full">
          <nav className="space-y-2 w-full">
            {navItems.map((item) => {
              const Tag = item.href ? Link : 'button';
              return (
                <Tag
                  key={item.label}
                  href={item.href}
                  onClick={item.onClick}
                  className={`flex items-center ${expanded ? 'space-x-4 p-3' : 'justify-center p-3'} hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors group relative w-full text-left`}
                >
                  <div className="relative">
                    <IconWrapper Icon={item.icon} className={`w-6 h-6 group-hover:scale-105 transition-transform text-black dark:text-white flex-shrink-0 ${item.label === 'Search' && isSearchOpen ? 'font-bold stroke-[3px]' : ''}`} />
                  </div>
                  {expanded && (
                    <span className={`text-base text-black dark:text-white group-hover:font-semibold transition-all whitespace-nowrap overflow-hidden opacity-100 duration-200 ${item.label === 'Messages' ? 'font-bold' : ''}`}>
                      {item.label}
                    </span>
                  )}
                </Tag>
              );
            })}

            {/* Create Button with Dropdown */}
            <div className="relative w-full">
              <button
                onClick={handleCreateClick}
                className={`w-full flex items-center ${expanded ? 'space-x-4 p-3 text-left' : 'justify-center p-3'} hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors group`}
              >
                <IconWrapper Icon={PlusSquare} className="w-6 h-6 group-hover:scale-105 transition-transform text-black dark:text-white flex-shrink-0" />
                {expanded && (
                  <span className="text-base text-black dark:text-white group-hover:font-semibold transition-all whitespace-nowrap overflow-hidden">
                    Create
                  </span>
                )}
              </button>

              {showCreateMenu && expanded && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-zinc-200 dark:border-zinc-700 py-2 z-50 overflow-hidden">
                  <button
                    onClick={() => { onCreateClick('blog'); setShowCreateMenu(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center space-x-3 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-black dark:text-white" />
                    <span className="text-black dark:text-white">Post</span>
                  </button>
                  <button
                    onClick={() => { onCreateClick('sfc'); setShowCreateMenu(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center space-x-3 transition-colors"
                  >
                    <Video className="w-5 h-5 text-black dark:text-white" />
                    <span className="text-black dark:text-white">Reel</span>
                  </button>
                  <button
                    onClick={() => { onCreateClick('image'); setShowCreateMenu(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center space-x-3 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5 text-black dark:text-white" />
                    <span className="text-black dark:text-white">Photo</span>
                  </button>
                </div>
              )}
            </div>

            {/* Profile */}
            <Link
                href={user?.username ? `/${user.username}` : '/signIn'}
                className={`flex items-center ${expanded ? 'space-x-4 p-3' : 'justify-center p-3'} hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors group`}
              >
                <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden group-hover:scale-105 transition-transform border border-transparent group-hover:border-black dark:group-hover:border-white flex-shrink-0">
                    <img 
                        src={user?.img || user?.photoURL || `https://ui-avatars.com/api/?name=${user?.username || user?.email || 'User'}&background=random`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                    />
                </div>
                {expanded && (
                  <span className="text-base text-black dark:text-white group-hover:font-semibold transition-all whitespace-nowrap overflow-hidden">
                    Profile
                  </span>
                )}
              </Link>
          </nav>
        </div>

        {/* Footer / More */}
        <div className="mt-auto w-full mb-4 relative">
          {showMoreMenu && expanded && (
            <div className="absolute left-0 bottom-full mb-2 w-64 bg-white dark:bg-zinc-800 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-zinc-200 dark:border-zinc-700 py-2 z-50 overflow-hidden">
              <div className="flex flex-col">
                <button className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center space-x-3 transition-colors">
                  <Settings className="w-5 h-5 text-black dark:text-white" />
                  <span className="text-black dark:text-white">Settings</span>
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center space-x-3 transition-colors">
                  <Activity className="w-5 h-5 text-black dark:text-white" />
                  <span className="text-black dark:text-white">Your activity</span>
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center space-x-3 transition-colors">
                  <Bookmark className="w-5 h-5 text-black dark:text-white" />
                  <span className="text-black dark:text-white">Saved</span>
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center space-x-3 transition-colors">
                  <Moon className="w-5 h-5 text-black dark:text-white" />
                  <span className="text-black dark:text-white">Switch appearance</span>
                </button>
                <button className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center space-x-3 transition-colors">
                  <MessageSquareWarning className="w-5 h-5 text-black dark:text-white" />
                  <span className="text-black dark:text-white">Report a problem</span>
                </button>
                <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1.5 mx-2" />
                <button className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center space-x-3 transition-colors">
                  <Repeat className="w-5 h-5 text-black dark:text-white" />
                  <span className="text-black dark:text-white">Switch accounts</span>
                </button>
                <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1.5 mx-2" />
                <button 
                  onClick={() => {
                    logout();
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center space-x-3 transition-colors"
                >
                  <LogOut className="w-5 h-5 text-black dark:text-white" />
                  <span className="text-black dark:text-white">Log out</span>
                </button>
              </div>
            </div>
          )}
          <button 
            onClick={handleMoreClick}
            className={`w-full flex items-center ${expanded ? 'space-x-4 p-3' : 'justify-center p-3'} hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors group`}
          >
            <IconWrapper Icon={Menu} className={`w-6 h-6 group-hover:scale-105 transition-transform text-black dark:text-white flex-shrink-0 ${showMoreMenu ? 'font-bold' : ''}`} />
            {expanded && (
              <span className={`text-base text-black dark:text-white group-hover:font-semibold transition-all whitespace-nowrap ${showMoreMenu ? 'font-bold' : ''}`}>
                More
              </span>
            )}
          </button>
        </div>
      </div>

      <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
