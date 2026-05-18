import Link from "next/link";
import { useRouter } from "next/router";
import { Heart, LogOut, MessageCircle } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import InstallPwaButton from "./InstallPwaButton";

export default function MobileHeader() {
  const router = useRouter();
  const { logout } = useUser();

  const handleLogout = () => {
    logout();
    router.push("/signIn");
  };

  const iconClass = (path) =>
    `flex min-h-11 min-w-11 items-center justify-center rounded-lg transition-colors ${
      router.pathname === path
        ? "text-black dark:text-white"
        : "text-zinc-500 hover:text-black dark:hover:text-white"
    }`;

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-zinc-200 bg-white pt-safe dark:border-zinc-800 dark:bg-black lg:hidden">
      <div className="flex h-12 items-center justify-between px-3">
        <Link
          href="/"
          className="text-lg font-bold italic text-black dark:text-white"
          style={{ fontFamily: "cursive" }}
        >
          Socio Gram
        </Link>
        <div className="flex items-center gap-1">
          <InstallPwaButton size="sm" variant="outline" />
          <Link href="/messages" aria-label="Messages" className={iconClass("/messages")}>
            <MessageCircle className="h-6 w-6" strokeWidth={2} />
          </Link>
          <Link
            href="/notifications"
            aria-label="Notifications"
            className={iconClass("/notifications")}
          >
            <Heart className="h-6 w-6" strokeWidth={2} />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:text-red-600 dark:hover:text-red-400"
          >
            <LogOut className="h-6 w-6" strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}
