import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Home,
  Compass,
  Clapperboard,
  PlusSquare,
  User,
  FileText,
  Video,
  Image as ImageIcon,
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export default function MobileNav({ onCreateClick }) {
  const router = useRouter();
  const { user } = useUser();
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const navItems = [
    { icon: Home, href: '/', label: 'Home' },
    { icon: Compass, href: '/explore', label: 'Explore' },
    { icon: PlusSquare, href: null, label: 'Create', isCreate: true },
    { icon: Clapperboard, href: '/reels', label: 'Reels' },
    {
      icon: User,
      href: user?.username ? `/${user.username}` : '/signIn',
      label: 'Profile',
    },
  ];

  const isActive = (href) => {
    if (href === '/') return router.pathname === '/';
    return href && router.pathname.startsWith(href);
  };

  const handleCreate = (type) => {
    if (onCreateClick) onCreateClick(type);
    setShowCreateMenu(false);
  };

  return (
    <>
      {showCreateMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setShowCreateMenu(false)}
        />
      )}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black lg:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-[var(--nav-height)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href ? isActive(item.href) : false;

            if (item.isCreate) {
              return (
                <div key={item.label} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCreateMenu(!showCreateMenu)}
                    className="flex flex-col items-center justify-center p-2"
                    aria-label="Create"
                  >
                    <Icon className="w-6 h-6 text-black dark:text-white" strokeWidth={2} />
                  </button>
                  {showCreateMenu && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg py-1 z-50">
                      <button
                        type="button"
                        onClick={() => handleCreate('blog')}
                        className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <FileText className="w-4 h-4" />
                        Post
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreate('sfc')}
                        className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Video className="w-4 h-4" />
                        Reel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreate('image')}
                        className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Photo
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center p-2 min-w-[48px]"
              >
                <Icon
                  className={`w-6 h-6 ${active ? 'text-black dark:text-white' : 'text-zinc-500'}`}
                  strokeWidth={active ? 2.5 : 2}
                />
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}


