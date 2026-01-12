import { useState, useEffect } from 'react';
import { X, Search, Send } from 'lucide-react';
import { getFirestore, collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { useUser } from '../contexts/UserContext';

export default function ShareModal({ isOpen, onClose, post }) {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const db = getFirestore();

  // Fetch recent chats on open
  useEffect(() => {
    if (!isOpen || !user) return;
    
    async function fetchRecents() {
        try {
            const q = query(
                collection(db, "chats"), 
                where("participants", "array-contains", user.username),
                orderBy("lastMessageTimestamp", "desc"),
                limit(10)
            );
            const snapshot = await getDocs(q);
            const chats = snapshot.docs.map(doc => {
                const data = doc.data();
                const otherUsername = data.participants.find(p => p !== user.username);
                return {
                    id: doc.id, // Chat ID
                    username: otherUsername,
                    img: data.participantDetails?.[otherUsername]?.img || `https://ui-avatars.com/api/?name=${otherUsername}&background=random`
                };
            });
            setRecentChats(chats);
        } catch (error) {
            console.error("Error fetching recent chats (likely missing index):", error);
            // Fallback: empty list or maybe a simple query without sort if index is missing? 
            // But usually we just want the dev to fix the index.
        }
    }
    fetchRecents();
  }, [isOpen, user]);

  // Search Logic
  useEffect(() => {
      const delayDebounceFn = setTimeout(async () => {
          if (searchTerm.trim()) {
              try {
                const q = query(
                    collection(db, 'users'),
                    where('username', '>=', searchTerm),
                    where('username', '<=', searchTerm + '\uf8ff'),
                    limit(5)
                );
                const snapshot = await getDocs(q);
                const results = snapshot.docs
                    .map(d => ({ id: d.id, ...d.data() }))
                    .filter(u => u.username !== user.username);
                setSearchResults(results);
              } catch (error) {
                console.error("Error searching users:", error);
              }
          } else {
              setSearchResults([]);
          }
      }, 300);
      return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, user]);

  const toggleUser = (userObj) => {
      if (selectedUsers.find(u => u.username === userObj.username)) {
          setSelectedUsers(selectedUsers.filter(u => u.username !== userObj.username));
      } else {
          setSelectedUsers([...selectedUsers, userObj]);
      }
  };

  const handleSend = async () => {
      if (selectedUsers.length === 0 || !user) return;
      setSending(true);

      try {
          // Send to each selected user
          await Promise.all(selectedUsers.map(async (recipient) => {
              // 1. Determine Chat ID
              const participants = [user.username, recipient.username].sort();
              const chatId = recipient.id && recipient.id.includes('_') ? recipient.id : `${participants[0]}_${participants[1]}`;
              
              const timestamp = Date.now();
              const messageText = `Shared a post: ${post.type === 'sfc' ? 'Reel' : 'Post'}`; // Simplified preview

              // 2. Add Message
              await addDoc(collection(db, "messages"), {
                  chatId,
                  text: messageText,
                  attachment: {
                      type: 'post_share',
                      postId: post.id,
                      postType: post.type,
                      thumbnail: post.videoUrl || post.imageUrl || null,
                      preview: post.caption || post.content || ''
                  },
                  sender: user.username,
                  receiver: recipient.username,
                  createdAt: serverTimestamp(),
                  timestamp: timestamp
              });

              // 3. Update Chat Metadata
              const chatRef = doc(db, "chats", chatId);
              await setDoc(chatRef, {
                  participants: participants,
                  lastMessage: `Shared a ${post.type === 'sfc' ? 'reel' : 'post'}`,
                  lastMessageTimestamp: timestamp,
                  participantDetails: {
                      [user.username]: {
                          name: user.username,
                          fullName: user.fullName || user.username,
                          img: `https://ui-avatars.com/api/?name=${user.username}&background=random`
                      },
                      [recipient.username]: {
                          name: recipient.username,
                          fullName: recipient.fullName || recipient.username,
                          img: recipient.img || `https://ui-avatars.com/api/?name=${recipient.username}&background=random`
                      }
                  }
              }, { merge: true });
          }));
          
          onClose();
          setSelectedUsers([]);
      } catch (error) {
          console.error("Error sharing post:", error);
      } finally {
          setSending(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
          {/* Header */}
          <div className="flex items-center justify-center relative p-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="font-bold text-base">Share</h2>
              <button onClick={onClose} className="absolute right-3 top-3">
                  <X className="w-6 h-6" />
              </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
               <div className="flex items-center space-x-2">
                   <span className="font-semibold text-base">To:</span>
                   <input 
                        type="text" 
                        placeholder="Search..." 
                        className="flex-1 bg-transparent focus:outline-none text-sm py-1"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                   />
               </div>
          </div>

          {/* List */}
          <div className="h-[300px] overflow-y-auto p-2">
              {searchTerm && searchResults.length > 0 ? (
                  searchResults.map(u => (
                      <div 
                        key={u.username} 
                        onClick={() => toggleUser({ username: u.username, fullName: u.fullName, img: `https://ui-avatars.com/api/?name=${u.username}&background=random` })}
                        className="flex items-center justify-between p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                      >
                          <div className="flex items-center space-x-3">
                              <img src={`https://ui-avatars.com/api/?name=${u.username}&background=random`} className="w-10 h-10 rounded-full" alt="" />
                              <div className="flex flex-col">
                                  <span className="font-semibold text-sm">{u.username}</span>
                                  <span className="text-xs text-zinc-500">{u.fullName}</span>
                              </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedUsers.find(sel => sel.username === u.username) ? 'bg-blue-500 border-blue-500' : 'border-zinc-300 dark:border-zinc-600'}`}>
                              {selectedUsers.find(sel => sel.username === u.username) && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                      </div>
                  ))
              ) : (
                  <>
                    <p className="px-2 py-1 text-sm text-zinc-500 font-semibold">Suggested</p>
                    {recentChats.map(chat => (
                        <div 
                            key={chat.id} 
                            onClick={() => toggleUser(chat)}
                            className="flex items-center justify-between p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                        >
                            <div className="flex items-center space-x-3">
                                <img src={chat.img} className="w-10 h-10 rounded-full" alt="" />
                                <span className="font-semibold text-sm">{chat.username}</span>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedUsers.find(sel => sel.username === chat.username) ? 'bg-blue-500 border-blue-500' : 'border-zinc-300 dark:border-zinc-600'}`}>
                                {selectedUsers.find(sel => sel.username === chat.username) && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                        </div>
                    ))}
                  </>
              )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
              <button 
                onClick={handleSend}
                disabled={selectedUsers.length === 0 || sending}
                className="w-full bg-[#0095f6] hover:bg-[#1877f2] disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                  {sending ? 'Sending...' : 'Send'}
              </button>
          </div>
      </div>
    </div>
  );
}
