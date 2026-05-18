import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Home,
  Search,
  Compass,
  Clapperboard,
  PlusSquare,
  FileText,
  Video,
  Image as ImageIcon,
} from "lucide-react";
import { useUser } from "../contexts/UserContext";

function Backdrop({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[55] bg-black/40 lg:hidden"
      onClick={onClose}
      aria-hidden
    />
  );
}

export default function MobileNav({ onCreateClick, onSearchOpen }) {
  const router = useRouter();
  const { user } = useUser();
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const profileHref = user?.username ? `/${user.username}` : "/signIn";

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Search", onClick: onSearchOpen },
    { icon: Compass, label: "Explore", href: "/explore" },
    { icon: Clapperboard, label: "Reels", href: "/reels" },
  ];

  const isActive = (href) => {
    if (href === "/") return router.pathname === "/";
    return router.pathname === href || router.pathname.startsWith(`${href}/`);
  };

  const isProfileActive =
    user?.username && router.pathname === `/${user.username}`;

  const handleCreate = (type) => {
    setShowCreateMenu(false);
    if (onCreateClick) {
      onCreateClick(type);
    } else {
      router.push("/");
    }
  };

  return (
    <>
      {showCreateMenu && <Backdrop onClose={() => setShowCreateMenu(false)} />}

      {showCreateMenu && (
        <div className="fixed bottom-16 left-0 right-0 z-[56] px-4 pb-2 lg:hidden">
          <div className="mx-auto max-w-sm overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => handleCreate("blog")}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <FileText className="h-5 w-5" />
              <span>Post</span>
            </button>
            <button
              type="button"
              onClick={() => handleCreate("sfc")}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <Video className="h-5 w-5" />
              <span>Reel</span>
            </button>
            <button
              type="button"
              onClick={() => handleCreate("image")}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <ImageIcon className="h-5 w-5" />
              <span>Photo</span>
            </button>
          </div>
        </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item) => {
            const active = item.href ? isActive(item.href) : false;
            const Tag = item.href ? Link : "button";
            return (
              <Tag
                key={item.label}
                href={item.href}
                onClick={item.onClick}
                aria-label={item.label}
                className={`flex flex-col items-center justify-center p-2 ${
                  active ? "text-black dark:text-white" : "text-zinc-500"
                }`}
              >
                <item.icon className="h-6 w-6" strokeWidth={active ? 2.5 : 2} />
              </Tag>
            );
          })}

          <button
            type="button"
            aria-label="Create"
            onClick={() => setShowCreateMenu((v) => !v)}
            className="flex flex-col items-center justify-center p-2 text-zinc-500"
          >
            <PlusSquare className="h-6 w-6" strokeWidth={2} />
          </button>

          <Link
            href={profileHref}
            aria-label="Profile"
            className={`flex flex-col items-center justify-center p-2 ${
              isProfileActive ? "text-black dark:text-white" : "text-zinc-500"
            }`}
          >
            <div
              className={`h-6 w-6 overflow-hidden rounded-full ring-2 ${
                isProfileActive
                  ? "ring-black dark:ring-white"
                  : "ring-transparent"
              }`}
            >
              <img
                src={
                  user?.img ||
                  user?.photoURL ||
                  `https://ui-avatars.com/api/?name=${user?.username || "User"}&background=random`
                }
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          </Link>
        </div>
      </nav>
    </>
  );
}
