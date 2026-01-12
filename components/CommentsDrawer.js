import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '../contexts/UserContext';

export default function CommentsDrawer({ isOpen, onClose, postId, postType }) {
  const { user } = useUser();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const commentsEndRef = useRef(null);
  const db = getFirestore();

  useEffect(() => {
    if (!isOpen || !postId) return;

    // Assuming comments are stored in a top-level 'comments' collection
    // with a 'postId' field. Alternatively, could be a subcollection.
    // Let's go with top-level for easier querying across types if needed.
    const q = query(
      collection(db, 'comments'),
      // where('postId', '==', postId), // Needs index, let's filter client side if small or use simple path
    );
    
    // Better: Subcollection `posts/{postId}/comments` or `sfc/{postId}/comments`
    // Since we have multiple collections (blogs, sfc, staticImage), 
    // let's use a root 'comments' collection with postId field.
    // But to avoid index issues immediately, let's use a subcollection pattern logic:
    // actually, let's stick to root 'comments' and filter by postId.
    // We need 'where' clause.
    
    // To make it simple and work without complex indexes right away for this demo:
    // We will use a subcollection `comments` under the specific post document.
    // This requires passing the collection name (e.g. 'sfc', 'blogs')
    
    const collectionName = postType === 'sfc' ? 'sfc' : 
                           postType === 'blog' ? 'blogs' : 
                           postType === 'image' ? 'staticImage' : 'sfc'; // Default to sfc if unsure

    const commentsRef = collection(db, collectionName, postId, 'comments');
    const qComments = query(commentsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(qComments, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [isOpen, postId, postType]);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const collectionName = postType === 'sfc' ? 'sfc' : 
                           postType === 'blog' ? 'blogs' : 
                           postType === 'image' ? 'staticImage' : 'sfc';

    try {
      await addDoc(collection(db, collectionName, postId, 'comments'), {
        text: newComment,
        username: user.username,
        userImg: user.img || user.photoURL || `https://ui-avatars.com/api/?name=${user.username}&background=random`,
        createdAt: serverTimestamp(),
      });
      setNewComment('');
    } catch (error) {
      console.error("Error sending comment:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="w-full md:w-[400px] h-full bg-white dark:bg-zinc-900 flex flex-col shadow-2xl transform transition-transform duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-bold">Comments</h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <p>No comments yet.</p>
              <p className="text-sm">Start the conversation.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <img 
                  src={comment.userImg} 
                  alt={comment.username} 
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-semibold text-sm">{comment.username}</span>
                    <span className="text-xs text-zinc-500">
                      {comment.createdAt?.seconds ? new Date(comment.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 mt-0.5">{comment.text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <form onSubmit={handleSendComment} className="flex items-center space-x-2">
            <img 
               src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random`}
               className="w-8 h-8 rounded-full"
               alt=""
            />
            <div className="flex-1 relative">
                <input
                type="text"
                placeholder="Add a comment..."
                className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                />
                <button 
                    type="submit" 
                    disabled={!newComment.trim()}
                    className="absolute right-2 top-1.5 text-[#0095f6] disabled:text-zinc-400 font-semibold text-sm p-1"
                >
                    Post
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
