import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import Link from 'next/link';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

export default function RightSidebar() {
  const { user, logout } = useUser();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    async function fetchSuggestions() {
      const db = getFirestore();
      const usernames = ['carryminati', 'bhuvan.bam22', 'zakirkhan_208', 'prajakta.koli', 'kushakapila'];
      try {
        const q = query(collection(db, 'users'), where('username', 'in', usernames));
        const snapshot = await getDocs(q);
        const fetchedUsers = snapshot.docs.map(doc => doc.data());
        
        const suggestionsData = [
            { username: 'carryminati', subtitle: 'Popular on YouTube' },
            { username: 'bhuvan.bam22', subtitle: 'Followed by rvcjinsta + 1 more' },
            { username: 'zakirkhan_208', subtitle: 'Suggested for you' },
            { username: 'prajakta.koli', subtitle: 'Followed by filtercopy' },
            { username: 'kushakapila', subtitle: 'Suggested for you' },
        ];

        const merged = suggestionsData.map(s => {
            const u = fetchedUsers.find(user => user.username === s.username);
            return { ...s, img: u?.img || u?.photoURL };
        });
        setSuggestions(merged);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    }
    fetchSuggestions();
  }, []);

  const footerLinks = [
    'About', 'Help', 'Press', 'API', 'Jobs', 'Privacy', 'Terms', 'Locations', 'Language', 'Meta Verified'
  ];

  return (
    <div className="w-[380px] pl-12 pt-8 hidden lg:block">
      {/* Current User */}
      <div className="flex items-center justify-between mb-6">
        <Link href={user?.username ? `/${user.username}` : '/signIn'} className="flex items-center space-x-4 group">
          <div className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
             {/* Replace with user.profilePic if available */}
             <div className="w-full h-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-white dark:bg-black p-[2px]">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                    />
                </div>
             </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-black dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
              {user?.username || user?.email?.split('@')[0] || 'User'}
            </span>
            <span className="text-sm text-zinc-500">
              {user?.fullName || ''}
            </span>
          </div>
        </Link>
        <button 
          onClick={logout}
          className="text-xs font-semibold text-blue-500 hover:text-blue-700"
        >
          Switch
        </button>
      </div>

      {/* Suggestions Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-zinc-500">Suggested for you</span>
        <button className="text-xs font-semibold text-black dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300">
          See All
        </button>
      </div>

      {/* Suggestions List */}
      <div className="flex flex-col gap-4 mb-8">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href={`/${suggestion.username}`} className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden cursor-pointer">
                <img 
                    src={`https://ui-avatars.com/api/?name=${suggestion.username}&background=random`} 
                    alt={suggestion.username} 
                    className="w-full h-full object-cover"
                />
              </Link>
              <div className="flex flex-col">
                <Link href={`/${suggestion.username}`} className="text-sm font-semibold text-black dark:text-white hover:underline cursor-pointer">
                  {suggestion.username}
                </Link>
                <span className="text-xs text-zinc-500 truncate max-w-[180px]">
                  {suggestion.subtitle}
                </span>
              </div>
            </div>
            <button className="text-xs font-semibold text-blue-500 hover:text-blue-700">
              Follow
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap gap-x-2 gap-y-1 mb-4">
        {footerLinks.map((link, index) => (
          <React.Fragment key={link}>
            <a href="#" className="text-xs text-zinc-400 hover:underline">
              {link}
            </a>
            {index < footerLinks.length - 1 && (
                <span className="text-[2px] text-zinc-400 self-center">•</span>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="text-xs text-zinc-400 uppercase">
        © 2026 INSTAGRAM FROM META
      </div>
    </div>
  );
}
