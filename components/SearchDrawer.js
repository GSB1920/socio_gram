import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function SearchDrawer({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Search logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim()) {
        setLoading(true);
        const db = getFirestore();
        try {
          const q = query(
            collection(db, 'users'),
            where('username', '>=', searchTerm),
            where('username', '<=', searchTerm + '\uf8ff'),
            limit(10)
          );
          
          const querySnapshot = await getDocs(q);
          const results = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setSearchResults(results);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleUserClick = (user) => {
    // Add to recent searches
    const newRecent = [user, ...recentSearches.filter(u => u.username !== user.username)].slice(0, 10);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    onClose();
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const removeRecent = (username) => {
    const newRecent = recentSearches.filter(u => u.username !== username);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/5" 
          onClick={onClose}
        />
      )}
      <div 
        className={`fixed top-0 left-[72px] h-full bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 z-40 transition-transform duration-300 ease-in-out w-[397px] shadow-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      <div className="flex flex-col h-full">
        <div className="p-6 pb-2">
          <h2 className="text-2xl font-semibold mb-8">Search</h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg py-2 pl-10 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-2 flex items-center"
              >
                <X className="h-4 w-4 text-zinc-400 bg-zinc-200 dark:bg-zinc-700 rounded-full p-0.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto border-t border-zinc-100 dark:border-zinc-800 mt-4">
          {searchTerm ? (
            // Search Results
            <div className="pt-2">
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map(user => (
                  <Link 
                    key={user.id} 
                    href={`/${user.username}`}
                    onClick={() => handleUserClick(user)}
                    className="flex items-center px-6 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-800 mr-3 overflow-hidden border border-zinc-200 dark:border-zinc-700">
                        <img 
                            src={user.img || user.photoURL || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                            alt={user.username}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{user.username}</div>
                      <div className="text-zinc-500 text-sm">{user.fullName}</div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center text-zinc-500 text-sm p-4">No results found.</div>
              )}
            </div>
          ) : (
            // Recent Searches
            <div className="pt-2">
              <div className="flex justify-between items-center px-6 py-2 mb-2">
                <span className="font-semibold text-base">Recent</span>
                {recentSearches.length > 0 && (
                  <button onClick={clearRecent} className="text-[#0095f6] text-sm font-semibold hover:text-[#00376b]">
                    Clear all
                  </button>
                )}
              </div>
              
              {recentSearches.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-zinc-500">
                   <span className="font-semibold text-sm">No recent searches.</span>
                </div>
              ) : (
                recentSearches.map(user => (
                  <Link 
                    key={user.username} 
                    href={`/${user.username}`}
                    onClick={() => handleUserClick(user)}
                    className="flex items-center justify-between px-6 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group"
                  >
                    <div className="flex items-center">
                        <div className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-800 mr-3 overflow-hidden border border-zinc-200 dark:border-zinc-700">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                                alt={user.username}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                        <div className="font-semibold text-sm">{user.username}</div>
                        <div className="text-zinc-500 text-sm">{user.fullName}</div>
                        </div>
                    </div>
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeRecent(user.username);
                        }}
                        className="text-zinc-400 hover:text-zinc-600 p-2"
                    >
                        <X className="w-4 h-4" />
                    </button>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
