import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, Menu, LogOut } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import SearchDrawer from './SearchDrawer';
import InstallPwaButton from './InstallPwaButton';

export default function MobileHeader() {
  const { user, logout } = useUser();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowMenu(false);
    router.push('/signIn');
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 h-[var(--header-height)] border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black lg:hidden">
        <div className="flex items-center justify-between h-full px-4">
          <Link
            href="/"
            className="text-xl font-bold italic text-black dark:text-white"
            style={{ fontFamily: 'cursive' }}
          >
            Socio Gram
          </Link>

          <div className="flex items-center gap-1">
            <InstallPwaButton size="sm" />
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg"
              aria-label="Search"
            >
              <Search className="w-6 h-6 text-black dark:text-white" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg"
                aria-label="Menu"
              >
                <Menu className="w-6 h-6 text-black dark:text-white" />
              </button>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                    aria-hidden
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                    <Link
                      href={user?.username ? `/${user.username}` : '/signIn'}
                      onClick={() => setShowMenu(false)}
                      className="block px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <SearchDrawer isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} mobile />
    </>
  );
}

