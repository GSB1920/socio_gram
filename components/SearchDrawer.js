import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { getFirestore, collection, query, where, getDocs, limit } from "firebase/firestore";
import Link from "next/link";

export default function SearchDrawer({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim()) {
        setLoading(true);
        const db = getFirestore();
        try {
          const q = query(
            collection(db, "users"),
            where("username", ">=", searchTerm),
            where("username", "<=", searchTerm + "\uf8ff"),
            limit(10)
          );

          const querySnapshot = await getDocs(q);
          const results = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
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
    const newRecent = [
      user,
      ...recentSearches.filter((u) => u.username !== user.username),
    ].slice(0, 10);
    setRecentSearches(newRecent);
    localStorage.setItem("recentSearches", JSON.stringify(newRecent));
    onClose();
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const removeRecent = (username) => {
    const newRecent = recentSearches.filter((u) => u.username !== username);
    setRecentSearches(newRecent);
    localStorage.setItem("recentSearches", JSON.stringify(newRecent));
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 lg:bg-black/5"
          onClick={onClose}
          aria-hidden
        />
      )}
      <div
        className={`fixed top-0 z-[70] h-full w-full max-w-full border-r border-zinc-200 bg-white shadow-xl transition-transform duration-300 ease-in-out dark:border-zinc-800 dark:bg-black lg:left-[72px] lg:w-[397px] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="px-4 pb-2 pt-safe sm:px-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Search</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 lg:hidden"
                aria-label="Close search"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-zinc-400" />
              </div>
              <input
                type="text"
                placeholder="Search"
                className="w-full rounded-lg bg-zinc-100 py-2 pl-10 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:bg-zinc-800 dark:focus:ring-zinc-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-2 flex items-center"
                >
                  <X className="h-4 w-4 rounded-full bg-zinc-200 p-0.5 text-zinc-400 dark:bg-zinc-700" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto border-t border-zinc-100 dark:border-zinc-800">
            {searchTerm ? (
              <div className="pt-2">
                {loading ? (
                  <div className="flex justify-center p-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <Link
                      key={user.id}
                      href={`/${user.username}`}
                      onClick={() => handleUserClick(user)}
                      className="flex items-center px-6 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      <div className="mr-3 h-11 w-11 overflow-hidden rounded-full border border-zinc-200 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800">
                        <img
                          src={
                            user.img ||
                            user.photoURL ||
                            `https://ui-avatars.com/api/?name=${user.username}&background=random`
                          }
                          alt={user.username}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{user.username}</div>
                        <div className="text-sm text-zinc-500">{user.fullName}</div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-zinc-500">
                    No results found.
                  </div>
                )}
              </div>
            ) : (
              <div className="pt-2">
                <div className="mb-2 flex items-center justify-between px-6 py-2">
                  <span className="text-base font-semibold">Recent</span>
                  {recentSearches.length > 0 && (
                    <button
                      type="button"
                      onClick={clearRecent}
                      className="text-sm font-semibold text-[#0095f6] hover:text-[#00376b]"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {recentSearches.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center text-zinc-500">
                    <span className="text-sm font-semibold">No recent searches.</span>
                  </div>
                ) : (
                  recentSearches.map((user) => (
                    <Link
                      key={user.username}
                      href={`/${user.username}`}
                      onClick={() => handleUserClick(user)}
                      className="group flex items-center justify-between px-6 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      <div className="flex items-center">
                        <div className="mr-3 h-11 w-11 overflow-hidden rounded-full border border-zinc-200 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800">
                          <img
                            src={`https://ui-avatars.com/api/?name=${user.username}&background=random`}
                            alt={user.username}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">
                            {user.username}
                          </div>
                          <div className="text-sm text-zinc-500">{user.fullName}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeRecent(user.username);
                        }}
                        className="p-2 text-zinc-400 hover:text-zinc-600"
                      >
                        <X className="h-4 w-4" />
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
