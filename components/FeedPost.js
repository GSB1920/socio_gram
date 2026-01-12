import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, limit } from "firebase/firestore";
import { useUser } from "../contexts/UserContext";
import CommentsDrawer from "./CommentsDrawer";
import ShareModal from "./ShareModal";

export default function FeedPost({ item }) {
  const { user } = useUser();
  const db = getFirestore();
  
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(item.likes || item.likeCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [authorImg, setAuthorImg] = useState(null);

  useEffect(() => {
    async function fetchAuthor() {
        if (!item.username) return;
        try {
            const q = query(collection(db, 'users'), where('username', '==', item.username), limit(1));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const u = snap.docs[0].data();
                setAuthorImg(u.img || u.photoURL);
            }
        } catch (e) {
            console.error("Error fetching author:", e);
        }
    }
    fetchAuthor();
  }, [item.username, db]);

  // Initialize liked state
  useEffect(() => {
    if (item.likedBy && user) {
      setLiked(item.likedBy.includes(user.username));
    }
    // Normalize likes count key
    setLikesCount(item.likes || item.likeCount || 0);
  }, [item, user]);

  const handleLike = async () => {
    if (!user) return;
    
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

    // Determine collection name
    const collectionName = item.type === 'sfc' ? 'sfc' : 
                           item.type === 'blog' ? 'blogs' : 
                           item.type === 'image' ? 'staticImage' : 'sfc';
    
    const docRef = doc(db, collectionName, item.id);
    try {
        await updateDoc(docRef, {
            likes: newLiked ? likesCount + 1 : likesCount - 1,
            likeCount: newLiked ? likesCount + 1 : likesCount - 1, // Update both for compatibility
            likedBy: newLiked ? arrayUnion(user.username) : arrayRemove(user.username)
        });
    } catch (e) {
        console.error("Error updating like:", e);
        setLiked(!newLiked);
        setLikesCount(prev => newLiked ? prev - 1 : prev + 1);
    }
  };

  const createdAt = item.date ? new Date(item.date) : item.createdAt ? new Date(item.createdAt.seconds * 1000) : item.timestamp ? new Date(item.timestamp) : null;
  const timeAgo = createdAt ? createdAt.toLocaleDateString() : '';

  return (
    <article className="w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
      {/* Header */}
      <header className="flex items-center justify-between py-3 px-1">
        <Link href={`/${item.username}`} className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800">
                <img src={authorImg || `https://ui-avatars.com/api/?name=${item.username}&background=random`} alt={item.username} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-semibold text-black dark:text-white group-hover:opacity-80">
                {item.username}
            </span>
            {timeAgo && (
                <span className="text-xs text-zinc-500">
                • {timeAgo}
                </span>
            )}
        </Link>
        <button className="text-black dark:text-white">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* Content based on type */}
      {item.type === 'image' && item.staticImageLink && (
        <div className="w-full aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden rounded-sm border border-zinc-100 dark:border-zinc-800">
          <img
            src={item.staticImageLink}
            alt={item.caption || "Image"}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {item.type === 'sfc' && item.sfcLink && (
        <div className="w-full bg-black aspect-[4/5] max-h-[580px] rounded-sm overflow-hidden flex items-center justify-center">
          <video
            src={item.sfcLink}
            controls
            className="h-full w-full object-contain"
          />
        </div>
      )}

      {item.type === 'blog' && (
        <div className="w-full p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-sm">
            <h2 className="text-xl font-bold mb-3 text-black dark:text-white">
            {item.title}
            </h2>
            <p className="text-sm text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap line-clamp-[10]">
            {item.body}
            </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between px-1 py-3">
        <div className="flex items-center space-x-4">
          <button onClick={handleLike} className="hover:opacity-60">
            <Heart className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : 'text-black dark:text-white'}`} />
          </button>
          <button onClick={() => setShowComments(true)} className="hover:opacity-60">
            <MessageCircle className="w-6 h-6 text-black dark:text-white" />
          </button>
          <button onClick={() => setShowShare(true)} className="hover:opacity-60">
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
          {likesCount} likes • {item.comments || 0} comments • {item.shares || 0} shares
        </div>
        
        {(item.caption || (item.type === 'blog' && item.caption)) && (
          <div className="text-sm text-black dark:text-white">
            <Link href={`/${item.username}`} className="font-semibold mr-2 hover:opacity-80">{item.username}</Link>
            {item.caption}
          </div>
        )}

        <button onClick={() => setShowComments(true)} className="text-sm text-zinc-500 dark:text-zinc-400">
          View all {item.comments || 0} comments
        </button>

        <div className="flex items-center justify-between mt-2">
           <input 
            type="text" 
            placeholder="Add a comment..." 
            className="w-full text-sm bg-transparent border-none focus:ring-0 p-0 text-black dark:text-white placeholder-zinc-500"
            onClick={() => setShowComments(true)} // Open drawer on click
            readOnly // Make it read-only to force using drawer
           />
        </div>
      </div>

      {/* Modals */}
      <CommentsDrawer 
        isOpen={showComments} 
        onClose={() => setShowComments(false)} 
        postId={item.id} 
        postType={item.type}
      />
      <ShareModal 
        isOpen={showShare} 
        onClose={() => setShowShare(false)} 
        post={item} 
      />
    </article>
  );
}
