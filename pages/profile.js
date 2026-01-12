import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Settings, Grid, Bookmark, UserSquare2, Clapperboard } from "lucide-react";
import Layout from "../components/Layout";
import { useUser } from "../contexts/UserContext";
import "../lib/firebase";

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const [activeTab, setActiveTab] = useState("posts");
  const [blogs, setBlogs] = useState([]);
  const [sfcs, setSfcs] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    if (!user) return;

    async function fetchContent() {
      setLoading(true);
      const db = getFirestore();
      try {
        // Fetch Blogs
        const blogsQ = query(collection(db, "blogs"), where("username", "==", user.username));
        const blogsSnap = await getDocs(blogsQ);
        setBlogs(blogsSnap.docs.map(doc => ({ id: doc.id, type: 'blog', ...doc.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));

        // Fetch SFC (Reels)
        const sfcQ = query(collection(db, "sfc"), where("username", "==", user.username));
        const sfcSnap = await getDocs(sfcQ);
        setSfcs(sfcSnap.docs.map(doc => ({ id: doc.id, type: 'sfc', ...doc.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));

        // Fetch Images
        const imgQ = query(collection(db, "staticImage"), where("username", "==", user.username));
        const imgSnap = await getDocs(imgQ);
        setImages(imgSnap.docs.map(doc => ({ id: doc.id, type: 'image', ...doc.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      } catch (error) {
        console.error("Error fetching profile content:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [user, userLoading]);

  // Merge images and blogs for "Posts" tab (mimicking Instagram mixed grid)
  // For this implementation, we'll put images and blogs in "Posts", SFC in "Reels"
  const posts = [...images, ...blogs].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  if (userLoading || (!user && loading)) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto md:px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-12 px-4 mb-12">
          {/* Avatar */}
          <div className="w-20 h-20 md:w-36 md:h-36 rounded-full bg-zinc-200 dark:bg-zinc-800 p-[2px] mb-4 md:mb-0 flex-shrink-0 cursor-pointer">
             <img 
                src={user?.img || user?.photoURL || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=random&size=150`} 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
             />
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col items-center md:items-start">
             <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <h2 className="text-xl text-black dark:text-zinc-50">{user?.username}</h2>
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
             </div>

             {/* Stats */}
             <div className="flex space-x-8 mb-4 text-sm md:text-base">
                <div className="text-black dark:text-zinc-50">
                    <span className="font-bold">{posts.length + sfcs.length}</span> posts
                </div>
                <div className="text-black dark:text-zinc-50">
                    <span className="font-bold">{user?.followers || 0}</span> followers
                </div>
                <div className="text-black dark:text-zinc-50">
                    <span className="font-bold">{user?.following || 0}</span> following
                </div>
             </div>

             {/* Bio */}
             <div className="text-sm text-center md:text-left">
                <div className="font-semibold text-black dark:text-white">{user?.fullName}</div>
                <div className="text-black dark:text-zinc-50">Digital Creator 📸</div>
                <div className="text-black dark:text-zinc-50">Welcome to my Socio Gram world! 🌍</div>
             </div>
          </div>
        </div>

        {/* Highlights Placeholder */}
        <div className="px-4 mb-12 flex space-x-6 overflow-x-auto pb-2 scrollbar-hide">
             {[1,2,3].map(i => (
                 <div key={i} className="flex flex-col items-center space-y-1 cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"></div>
                    <span className="text-xs text-black dark:text-white">Highlight</span>
                 </div>
             ))}
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
                <button 
                    onClick={() => setActiveTab('saved')}
                    className={`flex items-center space-x-2 py-3 border-t md:border-t-2 text-xs font-semibold tracking-widest uppercase transition-colors ${activeTab === 'saved' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-zinc-500'}`}
                >
                    <Bookmark className="w-3 h-3" />
                    <span className="hidden md:block">Saved</span>
                </button>
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
                    <div key={item.id} className="aspect-square relative group cursor-pointer bg-zinc-100 dark:bg-zinc-900">
                        {item.type === 'image' && (
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        )}
                        {item.type === 'blog' && (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 p-2 text-center text-xs">
                                <span className="line-clamp-4">{item.content}</span>
                            </div>
                        )}
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center text-white font-bold gap-4">
                            {/* Likes/Comments counts would go here */}
                        </div>
                    </div>
                )) : (
                    <div className="col-span-3 py-12 flex flex-col items-center text-zinc-500">
                        <div className="w-16 h-16 border-2 border-zinc-300 rounded-full flex items-center justify-center mb-4">
                            <Grid className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-black dark:text-white">Share Photos</h3>
                        <p className="text-sm">When you share photos, they will appear on your profile.</p>
                    </div>
                )
            )}

            {activeTab === 'reels' && (
                sfcs.length > 0 ? sfcs.map(item => (
                    <div key={item.id} className="aspect-[9/16] relative group cursor-pointer bg-zinc-100 dark:bg-zinc-900">
                         {/* Thumbnail logic would go here, for now using video directly or placeholder */}
                         <video src={item.videoUrl} className="w-full h-full object-cover" />
                         <div className="absolute bottom-2 left-2 flex items-center text-white text-xs font-bold drop-shadow-md">
                            <Clapperboard className="w-3 h-3 mr-1" /> 1.2k
                         </div>
                    </div>
                )) : (
                    <div className="col-span-3 py-12 flex flex-col items-center text-zinc-500">
                         <div className="w-16 h-16 border-2 border-zinc-300 rounded-full flex items-center justify-center mb-4">
                            <Clapperboard className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-black dark:text-white">Share Reels</h3>
                        <p className="text-sm">When you share reels, they will appear on your profile.</p>
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
                    <p className="text-sm text-center max-w-xs">
                        {activeTab === 'saved' 
                            ? 'Save photos and videos that you want to see again. No one is notified, and only you can see what you\'ve saved.' 
                            : 'When people tag you in photos, they\'ll appear here.'}
                    </p>
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
}
