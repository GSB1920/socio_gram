import Link from "next/link";
import { useRouter } from "next/router";
import { Heart, MessageCircle } from "lucide-react";

export default function MobileHeader() {
  const router = useRouter();

  const isMessages = router.pathname === "/messages";
  const isNotifications = router.pathname === "/notifications";

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black lg:hidden">
      <div className="pt-safe flex h-[var(--header-height)] items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-bold italic"
          style={{ fontFamily: "cursive" }}
        >
          Socio Gram
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className={`flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 ${
              isNotifications
                ? "text-black dark:text-white"
                : "text-zinc-500"
            }`}
          >
            <Heart
              className="h-6 w-6"
              strokeWidth={isNotifications ? 2.5 : 2}
            />
          </Link>
          <Link
            href="/messages"
            aria-label="Messages"
            className={`flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 ${
              isMessages ? "text-black dark:text-white" : "text-zinc-500"
            }`}
          >
            <MessageCircle
              className="h-6 w-6"
              strokeWidth={isMessages ? 2.5 : 2}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
