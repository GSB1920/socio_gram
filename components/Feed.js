import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import '../lib/firebase';
import FeedPost from './FeedPost';
import InstallPwaButton from './InstallPwaButton';

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
    <div className="mb-4 flex space-x-4 overflow-x-auto bg-transparent px-2 py-4 scrollbar-hide lg:px-0">
      {stories.map((story) => (
        <div key={story.id} className="flex min-w-[56px] cursor-pointer flex-col items-center space-y-1 group lg:min-w-[66px]">
          <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[2px] lg:h-[66px] lg:w-[66px]">
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
    <div className="-mx-2 mx-auto flex w-full max-w-full flex-col gap-4 pb-8 lg:mx-0 lg:max-w-[470px]">
      <InstallPwaButton variant="outline" className="mx-2 w-[calc(100%-1rem)] lg:mx-0 lg:w-full" />
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
