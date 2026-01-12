import { useState, useEffect } from "react";
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import Layout from "../components/Layout";
import { useUser } from "../contexts/UserContext";
import "../lib/firebase";

export default function NotificationsPage() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const db = getFirestore();
    // Assuming 'notifications' collection exists with 'recipientId' field
    // If not, this will just return empty, which is better than mock data
    const q = query(
        collection(db, 'notifications'), 
        where('recipientId', '==', user.uid || user.username), // Try matching uid or username
        orderBy('createdAt', 'desc'), 
        limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotifications(notifs);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching notifications:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
      return (
          <Layout>
              <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div>
              </div>
          </Layout>
      );
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>

        {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <div className="w-16 h-16 border-2 border-zinc-300 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart w-8 h-8"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white">Activity On Your Posts</h3>
                <p className="text-sm text-center mt-2">When someone likes or comments on one of your posts, you'll see it here.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {notifications.map(notif => (
                    <div key={notif.id} className="flex items-center justify-between p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg cursor-pointer transition-colors">
                        <div className="flex items-center space-x-3">
                             <div className="w-11 h-11 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                 <img 
                                    src={notif.senderImg || `https://ui-avatars.com/api/?name=${notif.senderName || 'User'}&background=random`} 
                                    alt="" 
                                    className="w-full h-full object-cover" 
                                 />
                             </div>
                             <div className="text-sm">
                                 <span className="font-semibold mr-1">{notif.senderName}</span>
                                 <span>{notif.text}</span>
                                 <span className="text-zinc-500 text-xs ml-1">{notif.timeAgo || 'recently'}</span>
                             </div>
                        </div>
                        {notif.type === 'follow' ? (
                            <button className="bg-[#0095f6] hover:bg-[#1877f2] text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                                Follow
                            </button>
                        ) : (
                            notif.postImg && (
                                <div className="w-11 h-11 rounded border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                                    <img src={notif.postImg} alt="" className="w-full h-full object-cover" />
                                </div>
                            )
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>
    </Layout>
  );
}
