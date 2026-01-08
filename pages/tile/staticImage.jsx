import React from "react";

export default function StaticImageTile({ item }) {
  const createdAt =
    item.date
      ? new Date(item.date)
      : item.timestamp
      ? new Date(item.timestamp)
      : null;

  return (
    <article className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900 shadow-sm">
      <header className="mb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-black dark:text-zinc-50">
            @{item.username}
          </h2>
          {createdAt && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {createdAt.toLocaleString()}
            </span>
          )}
        </div>
        {item.caption && (
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            {item.caption}
          </p>
        )}
      </header>

      {item.staticImageLink && (
        <div className="w-full mb-3">
          <img
            src={item.staticImageLink}
            alt={item.caption || "Image"}
            className="w-full max-h-[420px] object-contain rounded-lg border border-zinc-300 dark:border-zinc-700 bg-black/5 dark:bg-white/5"
          />
        </div>
      )}

      <footer className="mt-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <div>
          <span className="font-semibold">{item.likeCount ?? 0}</span> likes
          <span className="mx-1">•</span>
          <span className="font-semibold">
            {Array.isArray(item.comments) ? item.comments.length : 0}
          </span>{" "}
          comments
        </div>
      </footer>
    </article>
  );
}