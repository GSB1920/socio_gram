import React from "react";

export default function SFCTile({ sfc }) {
  const createdAt =
    sfc.date
      ? new Date(sfc.date)
      : sfc.timestamp
      ? new Date(sfc.timestamp)
      : null;

  return (
    <article className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900 shadow-sm">
      <header className="mb-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-black dark:text-zinc-50">
            @{sfc.username}
          </h2>
          {createdAt && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {createdAt.toLocaleString()}
            </span>
          )}
        </div>
        {sfc.caption && (
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            {sfc.caption}
          </p>
        )}
      </header>

      {sfc.sfcLink && (
        <div className="w-full mb-3">
          <video
            src={sfc.sfcLink}
            controls
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 max-h-[420px] bg-black"
          />
        </div>
      )}

      <footer className="mt-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <div>
          <span className="font-semibold">{sfc.likeCount ?? 0}</span> likes
          <span className="mx-1">•</span>
          <span className="font-semibold">
            {Array.isArray(sfc.comments) ? sfc.comments.length : 0}
          </span>{" "}
          comments
        </div>
        {sfc.duration != null && (
          <span>{Math.round(sfc.duration)}s</span>
        )}
      </footer>
    </article>
  );
}