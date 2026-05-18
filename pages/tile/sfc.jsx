import React from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";

export default function SFCTile({ sfc }) {
  const createdAt =
    sfc.date
      ? new Date(sfc.date)
      : sfc.timestamp
      ? new Date(sfc.timestamp)
      : null;

  const timeAgo = createdAt ? createdAt.toLocaleDateString() : '';

  return (
    <article className="w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
      {/* Header */}
      <header className="flex items-center justify-between py-3 px-1">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-sm font-semibold text-black dark:text-white">
            {sfc.username}
          </span>
          {timeAgo && (
            <span className="text-xs text-zinc-500">
              • {timeAgo}
            </span>
          )}
        </div>
        <button className="text-black dark:text-white">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Video */}
      {sfc.sfcLink && (
        <div className="w-full bg-black aspect-[9/16] max-h-[580px] rounded-sm overflow-hidden flex items-center justify-center">
          <video
            src={sfc.sfcLink}
            controls
            className="h-full w-full object-contain"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between px-1 py-3">
        <div className="flex items-center space-x-4">
          <button className="hover:opacity-60">
            <Heart className="w-6 h-6 text-black dark:text-white" />
          </button>
          <button className="hover:opacity-60">
            <MessageCircle className="w-6 h-6 text-black dark:text-white" />
          </button>
          <button className="hover:opacity-60">
            <Send className="w-6 h-6 text-black dark:text-white" />
          </button>
        </div>
        <button className="hover:opacity-60">
          <Bookmark className="w-6 h-6 text-black dark:text-white" />
        </button>
      </div>

      {/* Likes & Caption */}
      <div className="px-1 space-y-2">
        <div className="text-sm font-semibold text-black dark:text-white">
          {sfc.likeCount ?? 0} likes
        </div>
        
        {sfc.caption && (
          <div className="text-sm text-black dark:text-white">
            <span className="font-semibold mr-2">{sfc.username}</span>
            {sfc.caption}
          </div>
        )}

        <button className="text-sm text-zinc-500 dark:text-zinc-400">
          View all {Array.isArray(sfc.comments) ? sfc.comments.length : 0} comments
        </button>
        
         <div className="flex items-center justify-between mt-2">
           <input 
            type="text" 
            placeholder="Add a comment..." 
            className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 text-black dark:text-white placeholder-zinc-500"
           />
        </div>
      </div>
    </article>
  );
}
