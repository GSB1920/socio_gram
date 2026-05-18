import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Edit, Phone, Video, Info, Smile, Image as ImageIcon, Heart, Send, Search } from "lucide-react";
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, getDocs, limit, setDoc, doc } from "firebase/firestore";
import Layout from "../components/Layout";
import { useUser } from "../contexts/UserContext";
import "../lib/firebase";
import PostDetailModal from "../components/PostDetailModal";

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useUser();
  const [activeChat, setActiveChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  
  // "conversations" are the active chats shown in the sidebar
  const [conversations, setConversations] = useState([]);
  // "searchResults" are users found via search to start a new chat
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Post Detail Modal State
  const [viewPost, setViewPost] = useState(null);
  
  const messagesEndRef = useRef(null);
  const db = getFirestore();

  // 1. Fetch Active Conversations (Sidebar)
  useEffect(() => {
    if (!user) return;

    // Listen to 'chats' collection where current user is a participant
    const q = query(
        collection(db, "chats"), 
        where("participants", "array-contains", user.username),
        orderBy("lastMessageTimestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(doc => {
            const data = doc.data();
            // Identify the "other" participant
            const otherUsername = data.participants.find(p => p !== user.username);
            // Get details from the map (or fallback)
            const otherDetails = data.participantDetails?.[otherUsername] || { 
                name: otherUsername, 
                img: `https://ui-avatars.com/api/?name=${otherUsername}&background=random` 
            };

            return {
                id: doc.id,
                ...data,
                otherUser: {
                    username: otherUsername,
                    ...otherDetails
                }
            };
        });
        setConversations(chats);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Handle Search for New/Existing Chats
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
        if (searchTerm.trim() && user) {
            const q = query(
                collection(db, 'users'),
                where('username', '>=', searchTerm),
                where('username', '<=', searchTerm + '\uf8ff'),
                limit(10)
            );
            const snapshot = await getDocs(q);
            const results = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(u => u.username !== user.username); // Exclude self
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, user]);


  // 3. Auto-open chat from URL
  useEffect(() => {
      const { user: userId } = router.query;
      if (userId && user) {
          // Check if we already have a conversation with this user
          const existingChat = conversations.find(c => c.otherUser.username === userId);
          
          if (existingChat) {
              setActiveChat({
                  name: existingChat.otherUser.username,
                  img: existingChat.otherUser.img,
                  chatId: existingChat.id
              });
          } else {
              // Prepare a "temporary" active chat state
              // We won't create the 'chats' doc until a message is sent
              setActiveChat({
                  name: userId,
                  img: `https://ui-avatars.com/api/?name=${userId}&background=random`,
                  isNew: true 
              });
          }
      }
  }, [router.query, user, conversations]);

  // 4. Fetch Messages for Active Chat
  useEffect(() => {
    if (!activeChat || !user) return;

    // Determine Chat ID
    let chatId;
    if (activeChat.chatId) {
        chatId = activeChat.chatId;
    } else {
        const participants = [user.username, activeChat.name].sort();
        chatId = `${participants[0]}_${participants[1]}`;
    }

    const q = query(
        collection(db, "messages"),
        where("chatId", "==", chatId),
        orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs);
        scrollToBottom();
    });

    return () => unsubscribe();
  }, [activeChat, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat || !user) return;

    const participants = [user.username, activeChat.name].sort();
    const chatId = `${participants[0]}_${participants[1]}`;
    const timestamp = Date.now();

    try {
        // 1. Add Message to 'messages' collection
        await addDoc(collection(db, "messages"), {
            chatId,
            text: messageInput,
            sender: user.username,
            receiver: activeChat.name,
            createdAt: serverTimestamp(),
            timestamp: timestamp
        });

        // 2. Upsert 'chats' document (Conversation Metadata)
        // We store details for both participants so we can display them easily in the sidebar
        // In a production app, you might just store IDs and fetch profiles separately, 
        // but denormalizing here is faster for this demo.
        const chatRef = doc(db, "chats", chatId);
        await setDoc(chatRef, {
            participants: participants,
            lastMessage: messageInput,
            lastMessageTimestamp: timestamp, // Use client timestamp for sorting immediately
            participantDetails: {
                [user.username]: {
                    name: user.username,
                    fullName: user.fullName || user.username,
                    img: `https://ui-avatars.com/api/?name=${user.username}&background=random`
                },
                [activeChat.name]: {
                    name: activeChat.name,
                    fullName: activeChat.fullName || activeChat.name, // We might not have full name if it's a new chat, but that's okay
                    img: activeChat.img
                }
            }
        }, { merge: true });

        setMessageInput("");
        
        // If this was a new chat (not in conversations yet), it will appear automatically due to onSnapshot
    } catch (error) {
        console.error("Error sending message:", error);
    }
  };

  const handleSelectUser = (selectedUser) => {
      // Check if conversation exists
      const existing = conversations.find(c => c.otherUser.username === selectedUser.username);
      if (existing) {
          setActiveChat({
              name: existing.otherUser.username,
              img: existing.otherUser.img,
              chatId: existing.id
          });
      } else {
          setActiveChat({
              name: selectedUser.username,
              fullName: selectedUser.fullName,
              img: `https://ui-avatars.com/api/?name=${selectedUser.username}&background=random`,
              isNew: true
          });
      }
      setSearchTerm("");
      setSearchResults([]);
  };

  return (
    <Layout>
      <div className="flex h-screen bg-white dark:bg-black overflow-hidden">
        {/* Sidebar */}
        <div className={`w-full md:w-[350px] border-r border-zinc-200 dark:border-zinc-800 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="h-20 flex items-center justify-between px-6 pt-4 pb-2">
                <div className="font-bold text-xl flex items-center space-x-1 cursor-pointer">
                    <span>{user?.username}</span>
                    <span className="text-xs">▼</span>
                </div>
                <Edit className="w-6 h-6 cursor-pointer" />
            </div>
            
            <div className="flex items-center justify-between px-6 py-2">
                <h3 className="font-bold text-base">Messages</h3>
                <span className="text-sm text-zinc-500 font-semibold cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-300">Requests</span>
            </div>

            {/* Search Bar */}
            <div className="px-6 pb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <input 
                        type="text" 
                        placeholder="Search for people..." 
                        className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-200 dark:focus:ring-zinc-800"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {searchTerm ? (
                    // Search Results
                    <div>
                         <div className="px-6 py-2 text-xs font-semibold text-zinc-500">Found Users</div>
                         {searchResults.map(result => (
                             <div 
                                key={result.id}
                                onClick={() => handleSelectUser(result)}
                                className="flex items-center space-x-3 px-6 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                             >
                                <img 
                                    src={`https://ui-avatars.com/api/?name=${result.username}&background=random`} 
                                    className="w-14 h-14 rounded-full object-cover" 
                                    alt="" 
                                />
                                <div>
                                    <div className="text-sm font-semibold text-black dark:text-white">{result.username}</div>
                                    <div className="text-xs text-zinc-500">{result.fullName}</div>
                                </div>
                             </div>
                         ))}
                         {searchResults.length === 0 && (
                             <div className="px-6 py-4 text-sm text-zinc-500 text-center">No users found</div>
                         )}
                    </div>
                ) : (
                    // Active Conversations
                    conversations.length > 0 ? conversations.map(chat => (
                        <div 
                            key={chat.id} 
                            onClick={() => setActiveChat({
                                name: chat.otherUser.username,
                                img: chat.otherUser.img,
                                chatId: chat.id
                            })}
                            className={`flex items-center space-x-3 px-6 py-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${activeChat?.name === chat.otherUser.username ? 'bg-zinc-100 dark:bg-zinc-900' : ''}`}
                        >
                            <div className="relative">
                                    <img src={chat.otherUser.img} className="w-14 h-14 rounded-full object-cover" alt="" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="text-sm font-semibold text-black dark:text-white">{chat.otherUser.username}</div>
                                <div className="text-xs text-zinc-500 truncate flex items-center">
                                    <span className="truncate max-w-[150px]">{chat.lastMessage}</span>
                                    <span className="mx-1">•</span>
                                    <span>
                                        {(() => {
                                            const now = Date.now();
                                            const diff = now - (chat.lastMessageTimestamp || 0);
                                            if (diff < 60000) return 'Just now';
                                            if (diff < 3600000) return `${Math.floor(diff/60000)}m`;
                                            if (diff < 86400000) return `${Math.floor(diff/3600000)}h`;
                                            return `${Math.floor(diff/86400000)}d`;
                                        })()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
                            <p className="text-sm">No messages yet.</p>
                            <p className="text-xs">Search for a user to start chatting.</p>
                        </div>
                    )
                )}
            </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'} bg-white dark:bg-black`}>
            {activeChat ? (
                <>
                    {/* Header */}
                    <div className="h-20 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center space-x-3 cursor-pointer">
                             {/* Back button for mobile */}
                             <button onClick={() => setActiveChat(null)} className="md:hidden mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                             </button>
                             <img src={activeChat.img} className="w-11 h-11 rounded-full" alt="" />
                             <div>
                                <span className="font-semibold text-base block">{activeChat.name}</span>
                                <span className="text-xs text-zinc-500">Active now</span>
                             </div>
                        </div>
                        <div className="flex items-center space-x-6">
                            <Phone className="w-7 h-7 cursor-pointer" />
                            <Video className="w-7 h-7 cursor-pointer" />
                            <Info className="w-7 h-7 cursor-pointer" />
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                         <div className="flex justify-center text-xs text-zinc-400 my-4">Today</div>
                         
                         {/* Intro Message */}
                         <div className="flex flex-col items-center justify-center my-8 text-center">
                            <img src={activeChat.img} className="w-24 h-24 rounded-full mb-3" alt="" />
                            <h3 className="text-xl font-bold">{activeChat.name}</h3>
                            <p className="text-zinc-500 text-sm mb-4">{activeChat.name} • Instagram</p>
                            <button 
                                onClick={() => router.push(`/${activeChat.name}`)}
                                className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            >
                                View Profile
                            </button>
                         </div>

                         {/* Real Messages */}
                         {messages.map((msg) => {
                             const isMe = msg.sender === user?.username;
                             
                             // Check for attachment
                             if (msg.attachment && msg.attachment.type === 'post_share') {
                                 return (
                                     <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                         {!isMe && (
                                             <img src={activeChat.img} className="w-7 h-7 rounded-full mr-2 self-end mb-1" alt="" />
                                         )}
                                         <div 
                                            className={`cursor-pointer overflow-hidden max-w-[200px] sm:max-w-[240px] rounded-2xl border ${
                                                isMe 
                                                ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800' 
                                                : 'bg-white dark:bg-black border-zinc-200 dark:border-zinc-800'
                                            }`}
                                            onClick={() => setViewPost({ id: msg.attachment.postId, type: msg.attachment.postType })}
                                         >
                                            {/* Thumbnail */}
                                            <div className="w-full aspect-square bg-zinc-200 dark:bg-zinc-800 relative">
                                                {msg.attachment.thumbnail ? (
                                                    msg.attachment.postType === 'sfc' ? (
                                                        <video src={msg.attachment.thumbnail} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <img src={msg.attachment.thumbnail} className="w-full h-full object-cover" alt="" />
                                                    )
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-zinc-500">
                                                        <span>Post Unavailable</span>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Caption Preview */}
                                            <div className="p-3 bg-zinc-100 dark:bg-zinc-900">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <div className="w-5 h-5 rounded-full bg-zinc-300 dark:bg-zinc-700 overflow-hidden">
                                                        <img src={activeChat.img} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                    <span className="text-xs font-semibold">{msg.sender}</span>
                                                </div>
                                                <p className="text-xs line-clamp-2 text-black dark:text-white">
                                                    {msg.attachment.preview || 'Shared a post'}
                                                </p>
                                            </div>
                                         </div>
                                     </div>
                                 );
                             }

                             return (
                                 <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                     {!isMe && (
                                         <img src={activeChat.img} className="w-7 h-7 rounded-full mr-2 self-end mb-1" alt="" />
                                     )}
                                     <div 
                                        className={`px-4 py-2 max-w-[70%] text-sm ${
                                            isMe 
                                            ? 'bg-[#3797f0] text-white rounded-2xl rounded-tr-sm' 
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white rounded-2xl rounded-tl-sm'
                                        }`}
                                     >
                                         {msg.text}
                                     </div>
                                 </div>
                             );
                         })}
                         <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 m-4 mt-0">
                        <form 
                            onSubmit={handleSendMessage}
                            className="border border-zinc-200 dark:border-zinc-700 rounded-full px-4 py-2 flex items-center space-x-3 bg-white dark:bg-black"
                        >
                             <Smile className="w-6 h-6 text-zinc-500 cursor-pointer" />
                             <input 
                                type="text" 
                                placeholder="Message..." 
                                className="flex-1 bg-transparent focus:outline-none text-sm"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                             />
                             {messageInput.trim() ? (
                                 <button type="submit" className="text-[#0095f6] font-semibold text-sm">Send</button>
                             ) : (
                                 <>
                                    <ImageIcon className="w-6 h-6 text-zinc-500 cursor-pointer" />
                                    <Heart className="w-6 h-6 text-zinc-500 cursor-pointer" />
                                 </>
                             )}
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-24 h-24 border-2 border-black dark:border-white rounded-full flex items-center justify-center mb-4 relative">
                        <Send className="w-12 h-12 ml-1 mt-1 stroke-1" />
                    </div>
                    <h2 className="text-xl font-medium mb-2">Your messages</h2>
                    <p className="text-zinc-500 text-sm mb-6">Send private photos and messages to a friend or group.</p>
                    <button className="bg-[#0095f6] hover:bg-[#1877f2] text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                        Send message
                    </button>
                </div>
            )}
        </div>

        {/* Post Detail Modal */}
        <PostDetailModal 
            isOpen={!!viewPost} 
            onClose={() => setViewPost(null)} 
            postId={viewPost?.id} 
            postType={viewPost?.type} 
        />
      </div>
    </Layout>
  );
}
