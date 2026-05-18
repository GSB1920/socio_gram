import { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import MediaFrame from './MediaFrame';

export default function PostDetailModal({ isOpen, onClose, postId, postType }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !postId) return;

    async function fetchPost() {
      setLoading(true);
      const db = getFirestore();
      try {
        const collectionName =
          postType === 'sfc'
            ? 'sfc'
            : postType === 'blog'
              ? 'blogs'
              : postType === 'image'
                ? 'staticImage'
                : 'sfc';
        const docRef = doc(db, collectionName, postId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error('Error fetching post details:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [isOpen, postId, postType]);

  if (!isOpen) return null;

  const imageSrc = post?.staticImageLink || post?.imageUrl;
  const videoSrc = post?.videoUrl || post?.sfcLink;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-4xl flex-col overflow-hidden overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-black md:max-h-[90vh] md:flex-row md:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex min-h-[400px] flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-600" />
          </div>
        ) : post ? (
          <div className="flex h-full w-full flex-col md:flex-row">
            <div className="w-full shrink-0 md:flex md:min-h-0 md:flex-1 md:items-center md:justify-center md:bg-black">
              {postType === 'sfc' && videoSrc && (
                <MediaFrame variant="feed" className="border-0 md:max-h-full">
                  <video
                    src={videoSrc}
                    controls
                    autoPlay
                    playsInline
                    className="h-full w-full object-cover md:object-contain"
                  />
                </MediaFrame>
              )}
              {postType === 'image' && imageSrc && (
                <MediaFrame variant="feed" className="border-0 md:max-h-full">
                  <img src={imageSrc} alt="" className="h-full w-full object-cover md:object-contain" />
                </MediaFrame>
              )}
              {postType === 'blog' && (
                <div className="max-h-[60dvh] overflow-y-auto bg-black p-6 text-white md:max-h-none md:p-8">
                  <h2 className="mb-4 text-2xl font-bold">{post.title}</h2>
                  <p className="whitespace-pre-wrap">{post.body || post.content}</p>
                </div>
              )}
            </div>

            <div className="flex w-full flex-col border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black md:w-[350px] md:border-l md:border-t-0">
              <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex items-center space-x-3">
                  <img
                    src={`https://ui-avatars.com/api/?name=${post.username}&background=random`}
                    className="h-8 w-8 rounded-full"
                    alt=""
                  />
                  <span className="text-sm font-semibold">{post.username}</span>
                </div>
                <button type="button" onClick={onClose} aria-label="Close">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                {post.caption && (
                  <div className="flex space-x-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${post.username}&background=random`}
                      className="h-8 w-8 rounded-full"
                      alt=""
                    />
                    <div className="text-sm">
                      <span className="mr-2 font-semibold">{post.username}</span>
                      {post.caption}
                    </div>
                  </div>
                )}
                <div className="mt-8 text-center text-sm text-zinc-500">No comments yet.</div>
              </div>

              <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Heart className="h-6 w-6" />
                    <MessageCircle className="h-6 w-6" />
                    <Send className="h-6 w-6" />
                  </div>
                  <Bookmark className="h-6 w-6" />
                </div>
                <div className="mb-2 text-sm font-bold">
                  {post.likes || 0} likes • {post.comments || 0} comments • {post.shares || 0} shares
                </div>
                <div className="text-xs uppercase text-zinc-500">
                  {post.createdAt?.seconds
                    ? new Date(post.createdAt.seconds * 1000).toLocaleDateString()
                    : 'Just now'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full p-8 text-center">Post not found</div>
        )}
      </div>
    </div>
  );
}
