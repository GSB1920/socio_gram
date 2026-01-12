import React from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";

export default function StaticImageTile({ item }) {
  const createdAt =
    item.date
      ? new Date(item.date)
      : item.timestamp
      ? new Date(item.timestamp)
      : null;

  // Format time relative (simplified)
  const timeAgo = createdAt ? createdAt.toLocaleDateString() : '';

  return (
    <article className="w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
      {/* Header */}
      <header className="flex items-center justify-between py-3 px-1">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800" /> {/* Avatar Placeholder */}
          <span className="text-sm font-semibold text-black dark:text-white">
            {item.username}
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

      {/* Image */}
      {item.staticImageLink && (
        <div className="w-full aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden rounded-sm border border-zinc-100 dark:border-zinc-800">
          <img
            src={item.staticImageLink}
            alt={item.caption || "Image"}
            className="w-full h-full object-cover"
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
          {item.likeCount ?? 0} likes
        </div>
        
        {item.caption && (
          <div className="text-sm text-black dark:text-white">
            <span className="font-semibold mr-2">{item.username}</span>
            {item.caption}
          </div>
        )}

        <button className="text-sm text-zinc-500 dark:text-zinc-400">
          View all {Array.isArray(item.comments) ? item.comments.length : 0} comments
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
