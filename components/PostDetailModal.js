import { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

export default function PostDetailModal({ isOpen, onClose, postId, postType }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !postId) return;
    
    async function fetchPost() {
        setLoading(true);
        const db = getFirestore();
        try {
            const collectionName = postType === 'sfc' ? 'sfc' : 
                                   postType === 'blog' ? 'blogs' : 
                                   postType === 'image' ? 'staticImage' : 'sfc';
            const docRef = doc(db, collectionName, postId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                setPost({ id: docSnap.id, ...docSnap.data() });
            }
        } catch (error) {
            console.error("Error fetching post details:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchPost();
  }, [isOpen, postId, postType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-white dark:bg-black rounded-xl overflow-hidden shadow-2xl flex max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
          {loading ? (
              <div className="flex-1 flex items-center justify-center min-h-[400px]">
                  <div className="w-8 h-8 border-4 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div>
              </div>
          ) : post ? (
              <div className="flex w-full h-full flex-col md:flex-row">
                  {/* Media Side */}
                  <div className="bg-black flex items-center justify-center flex-1 min-h-[300px] md:min-h-0">
                      {postType === 'sfc' && post.videoUrl && (
                          <video src={post.videoUrl} controls autoPlay className="max-h-full max-w-full object-contain" />
                      )}
                      {postType === 'image' && post.staticImageLink && (
                          <img src={post.staticImageLink} alt="" className="max-h-full max-w-full object-contain" />
                      )}
                      {postType === 'blog' && (
                          <div className="p-8 text-white overflow-y-auto">
                              <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
                              <p className="whitespace-pre-wrap">{post.body}</p>
                          </div>
                      )}
                  </div>

                  {/* Info Side (Desktop only usually, or stacked) */}
                  <div className="w-full md:w-[350px] flex flex-col border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
                          <div className="flex items-center space-x-3">
                              <img src={`https://ui-avatars.com/api/?name=${post.username}&background=random`} className="w-8 h-8 rounded-full" alt="" />
                              <span className="font-semibold text-sm">{post.username}</span>
                          </div>
                          <button onClick={onClose}>
                              <X className="w-6 h-6" />
                          </button>
                      </div>

                      {/* Comments / Caption Area */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {/* Caption */}
                          {post.caption && (
                              <div className="flex space-x-3">
                                  <img src={`https://ui-avatars.com/api/?name=${post.username}&background=random`} className="w-8 h-8 rounded-full" alt="" />
                                  <div className="text-sm">
                                      <span className="font-semibold mr-2">{post.username}</span>
                                      {post.caption}
                                  </div>
                              </div>
                          )}
                          {/* Placeholder for comments */}
                          <div className="text-center text-zinc-500 text-sm mt-8">
                              No comments yet.
                          </div>
                      </div>

                      {/* Actions */}
                      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                          <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-4">
                                  <Heart className="w-6 h-6" />
                                  <MessageCircle className="w-6 h-6" />
                                  <Send className="w-6 h-6" />
                              </div>
                              <Bookmark className="w-6 h-6" />
                          </div>
                          <div className="text-sm font-bold mb-2">
                              {post.likes || 0} likes • {post.comments || 0} comments • {post.shares || 0} shares
                          </div>
                          <div className="text-xs text-zinc-500 uppercase">
                             {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                          </div>
                      </div>
                  </div>
              </div>
          ) : (
              <div className="p-8 text-center w-full">Post not found</div>
          )}
      </div>
    </div>
  );
}
