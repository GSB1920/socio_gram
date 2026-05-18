import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import '../lib/firebase';
import FeedPost from './FeedPost';

function Stories() {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    async function fetchUsers() {
      const db = getFirestore();
      try {
        // Fetch recent users to simulate stories
        const q = query(collection(db, 'users'), limit(15));
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStories(users);
      } catch (e) {
        console.error("Error fetching stories:", e);
      }
    }
    fetchUsers();
  }, []);

  if (stories.length === 0) return null;

  return (
    <div className="flex space-x-4 overflow-x-auto py-4 bg-transparent mb-4 scrollbar-hide">
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center space-y-1 min-w-[66px] cursor-pointer group">
          <div className="w-[66px] h-[66px] rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white dark:bg-black p-[2px]">
              <div className="w-full h-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <img 
                    src={`https://ui-avatars.com/api/?name=${story.username}&background=random`} 
                    alt={story.username}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                 />
              </div>
            </div>
          </div>
          <span className="text-xs truncate w-16 text-center text-zinc-700 dark:text-zinc-200">
            {story.username}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Feed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const db = getFirestore();
      
      try {
        const blogsRef = collection(db, 'blogs');
        const blogsSnap = await getDocs(query(blogsRef, orderBy('createdAt', 'desc')));
        const blogs = blogsSnap.docs.map(doc => ({ id: doc.id, type: 'blog', ...doc.data() }));

        const sfcRef = collection(db, 'sfc');
        const sfcSnap = await getDocs(query(sfcRef, orderBy('createdAt', 'desc')));
        const sfcs = sfcSnap.docs.map(doc => ({ id: doc.id, type: 'sfc', ...doc.data() }));

        const imageRef = collection(db, 'staticImage');
        const imageSnap = await getDocs(query(imageRef, orderBy('createdAt', 'desc')));
        const images = imageSnap.docs.map(doc => ({ id: doc.id, type: 'image', ...doc.data() }));

        const allItems = [...blogs, ...sfcs, ...images].sort((a, b) => {
            const dateA = a.createdAt || 0;
            const dateB = b.createdAt || 0;
            return dateB - dateA;
        });

        setItems(allItems);
      } catch (error) {
        console.error("Error fetching feed:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
        <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-[470px] mx-auto pb-8">
      <Stories />

      {items.map(item => (
        <FeedPost key={item.id} item={item} />
      ))}
      
      {items.length === 0 && (
          <div className="text-center py-10 text-zinc-500">
             <div className="text-4xl mb-4">📸</div>
             <p>No posts yet.</p>
             <p className="text-sm">Follow people or create a post to see it here.</p>
          </div>
      )}
    </div>
  );
}
