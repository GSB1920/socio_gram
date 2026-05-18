import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { Settings, Grid, Bookmark, UserSquare2, Clapperboard, MessageCircle, UserPlus } from "lucide-react";
import Layout from "../components/Layout";
import { useUser } from "../contexts/UserContext";
import "../lib/firebase";
import PostDetailModal from "../components/PostDetailModal";

export default function UserProfilePage() {
  const router = useRouter();
  const { username } = router.query;
  const { user: currentUser } = useUser();
  
  const [profileUser, setProfileUser] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [blogs, setBlogs] = useState([]);
  const [sfcs, setSfcs] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Modal state
  const [viewPost, setViewPost] = useState(null);

  useEffect(() => {
    if (!username) return;

    async function fetchProfileData() {
      setLoading(true);
      const db = getFirestore();
      try {
        // Fetch User Details
        const userQ = query(collection(db, "users"), where("username", "==", username), limit(1));
        const userSnap = await getDocs(userQ);
        
        if (!userSnap.empty) {
            const userData = { id: userSnap.docs[0].id, ...userSnap.docs[0].data() };
            setProfileUser(userData);

            // Fetch Blogs
            const blogsQ = query(collection(db, "blogs"), where("username", "==", username));
            const blogsSnap = await getDocs(blogsQ);
            setBlogs(blogsSnap.docs.map(doc => ({ id: doc.id, type: 'blog', ...doc.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));

            // Fetch SFC (Reels)
            const sfcQ = query(collection(db, "sfc"), where("username", "==", username));
            const sfcSnap = await getDocs(sfcQ);
            setSfcs(sfcSnap.docs.map(doc => ({ id: doc.id, type: 'sfc', ...doc.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));

            // Fetch Images
            const imgQ = query(collection(db, "staticImage"), where("username", "==", username));
            const imgSnap = await getDocs(imgQ);
            setImages(imgSnap.docs.map(doc => ({ id: doc.id, type: 'image', ...doc.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        } else {
            setProfileUser(null);
        }
      } catch (error) {
        console.error("Error fetching profile content:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [username]);

  const isCurrentUser = currentUser?.username === username;
  
  // Merge images and blogs for "Posts" tab
  const posts = [...images, ...blogs].sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
  });

  if (loading) {
    return (
        <Layout>
            <div className="flex justify-center items-center h-screen">
                <div className="w-8 h-8 border-4 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div>
            </div>
        </Layout>
    );
  }

  if (!profileUser) {
    return (
        <Layout>
            <div className="flex flex-col justify-center items-center h-[50vh] text-center">
                <h2 className="text-2xl font-bold mb-2">User not found</h2>
                <p className="text-zinc-500">The link you followed may be broken, or the page may have been removed.</p>
                <button onClick={() => router.push('/')} className="mt-4 text-blue-500 font-semibold">Go back to Instagram</button>
            </div>
        </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto md:px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-12 px-4 mb-12">
          {/* Avatar */}
          <div className="w-20 h-20 md:w-36 md:h-36 rounded-full bg-zinc-200 dark:bg-zinc-800 p-[2px] mb-4 md:mb-0 flex-shrink-0">
             <img 
                src={profileUser.img || profileUser.photoURL || `https://ui-avatars.com/api/?name=${profileUser.username}&background=random&size=150`} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
             />
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col items-center md:items-start">
             <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <h2 className="text-xl text-black dark:text-zinc-50">{profileUser.username}</h2>
                
                {isCurrentUser ? (
                    <div className="flex space-x-2">
                        <button className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white rounded-lg text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700">
                            Edit profile
                        </button>
                        <button className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white rounded-lg text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700">
                            View archive
                        </button>
                        <button className="p-1.5 text-black dark:text-white">
                            <Settings className="w-6 h-6" />
                        </button>
                    </div>
                ) : (
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => setIsFollowing(!isFollowing)}
                            className={`px-6 py-1.5 rounded-lg text-sm font-semibold ${isFollowing ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : 'bg-[#0095f6] text-white hover:bg-[#1877f2]'}`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        <button 
                            onClick={() => router.push(`/messages?user=${profileUser.username}`)}
                            className="px-4 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white rounded-lg text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        >
                            Message
                        </button>
                        <button className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-black dark:text-white">
                            <UserPlus className="w-5 h-5" />
                        </button>
                    </div>
                )}
             </div>

             {/* Stats */}
             <div className="flex space-x-8 mb-4 text-sm md:text-base">
                <div className="text-black dark:text-zinc-50">
                    <span className="font-bold">{posts.length + sfcs.length}</span> posts
                </div>
                <div className="text-black dark:text-zinc-50">
                    <span className="font-bold">{profileUser.followers || 0}</span> followers
                </div>
                <div className="text-black dark:text-zinc-50">
                    <span className="font-bold">{profileUser.following || 0}</span> following
                </div>
             </div>

             {/* Bio */}
             <div className="text-sm text-center md:text-left">
                <div className="font-semibold text-black dark:text-white">{profileUser.fullName}</div>
                <div className="text-black dark:text-zinc-50 whitespace-pre-wrap">{profileUser.bio || 'Digital Creator 📸'}</div>
             </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-center space-x-12">
                <button 
                    onClick={() => setActiveTab('posts')}
                    className={`flex items-center space-x-2 py-3 border-t md:border-t-2 text-xs font-semibold tracking-widest uppercase transition-colors ${activeTab === 'posts' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-zinc-500'}`}
                >
                    <Grid className="w-3 h-3" />
                    <span className="hidden md:block">Posts</span>
                </button>
                <button 
                    onClick={() => setActiveTab('reels')}
                    className={`flex items-center space-x-2 py-3 border-t md:border-t-2 text-xs font-semibold tracking-widest uppercase transition-colors ${activeTab === 'reels' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-zinc-500'}`}
                >
                    <Clapperboard className="w-3 h-3" />
                    <span className="hidden md:block">Reels</span>
                </button>
                {isCurrentUser && (
                    <button 
                        onClick={() => setActiveTab('saved')}
                        className={`flex items-center space-x-2 py-3 border-t md:border-t-2 text-xs font-semibold tracking-widest uppercase transition-colors ${activeTab === 'saved' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-zinc-500'}`}
                    >
                        <Bookmark className="w-3 h-3" />
                        <span className="hidden md:block">Saved</span>
                    </button>
                )}
                <button 
                    onClick={() => setActiveTab('tagged')}
                    className={`flex items-center space-x-2 py-3 border-t md:border-t-2 text-xs font-semibold tracking-widest uppercase transition-colors ${activeTab === 'tagged' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-zinc-500'}`}
                >
                    <UserSquare2 className="w-3 h-3" />
                    <span className="hidden md:block">Tagged</span>
                </button>
            </div>
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-3 gap-1 md:gap-8">
            {activeTab === 'posts' && (
                posts.length > 0 ? posts.map(item => (
                    <div 
                        key={item.id} 
                        className="aspect-square relative group cursor-pointer bg-zinc-100 dark:bg-zinc-900"
                        onClick={() => setViewPost(item)}
                    >
                        {item.type === 'image' && (
                            <img src={item.staticImageLink || item.imageUrl} alt="" className="w-full h-full object-cover" />
                        )}
                        {item.type === 'blog' && (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 p-2 text-center text-xs">
                                <span className="line-clamp-4">{item.content || item.body}</span>
                            </div>
                        )}
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center text-white font-bold gap-4">
                            <div className="flex items-center">
                                <span className="mr-1">{item.likes || item.likeCount || 0}</span> Likes
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-3 py-12 flex flex-col items-center text-zinc-500">
                        <div className="w-16 h-16 border-2 border-zinc-300 rounded-full flex items-center justify-center mb-4">
                            <Grid className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-black dark:text-white">{isCurrentUser ? 'Share Photos' : 'No Posts Yet'}</h3>
                    </div>
                )
            )}

            {activeTab === 'reels' && (
                sfcs.length > 0 ? sfcs.map(item => (
                    <div 
                        key={item.id} 
                        className="aspect-[9/16] relative group cursor-pointer bg-zinc-100 dark:bg-zinc-900"
                        onClick={() => setViewPost(item)}
                    >
                         <video src={item.videoUrl || item.sfcLink} className="w-full h-full object-cover" />
                         <div className="absolute bottom-2 left-2 flex items-center text-white text-xs font-bold drop-shadow-md">
                            <Clapperboard className="w-3 h-3 mr-1" /> {item.likes || item.likeCount || 0}
                         </div>
                    </div>
                )) : (
                    <div className="col-span-3 py-12 flex flex-col items-center text-zinc-500">
                         <div className="w-16 h-16 border-2 border-zinc-300 rounded-full flex items-center justify-center mb-4">
                            <Clapperboard className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-black dark:text-white">{isCurrentUser ? 'Share Reels' : 'No Reels Yet'}</h3>
                    </div>
                )
            )}
            
            {(activeTab === 'saved' || activeTab === 'tagged') && (
                <div className="col-span-3 py-12 flex flex-col items-center text-zinc-500">
                     <div className="w-16 h-16 border-2 border-zinc-300 rounded-full flex items-center justify-center mb-4">
                        {activeTab === 'saved' ? <Bookmark className="w-8 h-8" /> : <UserSquare2 className="w-8 h-8" />}
                    </div>
                    <h3 className="text-xl font-bold text-black dark:text-white">
                        {activeTab === 'saved' ? 'Saved' : 'Photos of you'}
                    </h3>
                    <p className="text-sm text-center max-w-xs mt-2">
                        {activeTab === 'saved' 
                            ? 'Save photos and videos that you want to see again. No one is notified, and only you can see what you\'ve saved.' 
                            : 'When people tag you in photos, they\'ll appear here.'}
                    </p>
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
