import { useState, useEffect, useRef } from "react";
import { getFirestore, collection, getDocs, query, orderBy, limit, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Music2, Camera } from "lucide-react";
import Layout from "../components/Layout";
import "../lib/firebase";
import { useUser } from "../contexts/UserContext";
import CommentsDrawer from "../components/CommentsDrawer";
import ShareModal from "../components/ShareModal";

function ReelItem({ reel, isActive }) {
    const { user } = useUser();
    const videoRef = useRef(null);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(reel.likes || 0);
    const [commentsCount, setCommentsCount] = useState(reel.comments || 0); // This might be static unless we listen
    
    const [showComments, setShowComments] = useState(false);
    const [showShare, setShowShare] = useState(false);

    const db = getFirestore();

    // Check if liked initially (simple local check if we had 'likedBy' array)
    // For now, defaulting to false or checking if user is in a 'likedBy' field if it existed.
    // Let's assume 'likedBy' array exists on the doc for this demo.
    useEffect(() => {
        if (reel.likedBy && user) {
            setLiked(reel.likedBy.includes(user.username));
        }
        if (reel.likes) setLikesCount(reel.likes);
    }, [reel, user]);

    // Autoplay logic
    useEffect(() => {
        if (isActive && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => console.log("Autoplay failed", e));
        } else if (videoRef.current) {
            videoRef.current.pause();
        }
    }, [isActive]);

    const togglePlay = () => {
        if (videoRef.current.paused) videoRef.current.play();
        else videoRef.current.pause();
    };

    const handleLike = async () => {
        if (!user) return;
        
        const newLiked = !liked;
        setLiked(newLiked);
        setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

        const reelRef = doc(db, 'sfc', reel.id);
        try {
            await updateDoc(reelRef, {
                likes: newLiked ? likesCount + 1 : likesCount - 1, // This is optimistic, strictly unsafe but ok for demo
                likedBy: newLiked ? arrayUnion(user.username) : arrayRemove(user.username)
            });
        } catch (e) {
            console.error("Error updating like:", e);
            // Revert on error
            setLiked(!newLiked);
            setLikesCount(prev => newLiked ? prev - 1 : prev + 1);
        }
    };

    return (
        <div className="relative w-full h-[calc(100vh-2rem)] md:h-[calc(100vh-40px)] bg-black snap-start flex-shrink-0 flex items-center justify-center rounded-lg overflow-hidden my-4 border border-zinc-800">
            {/* Video */}
            <video 
                ref={videoRef}
                src={reel.videoUrl} 
                className="w-full h-full object-cover cursor-pointer"
                loop
                onClick={togglePlay}
            />

            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent pt-20">
                <div className="flex items-center space-x-3 mb-3">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${reel.username}&background=random`} 
                        className="w-8 h-8 rounded-full border border-white"
                        alt={reel.username}
                    />
                    <span className="text-white font-semibold text-sm">{reel.username}</span>
                    <button className="text-white text-xs border border-white/50 px-2 py-1 rounded">Follow</button>
                </div>
                <p className="text-white text-sm mb-2 line-clamp-2">{reel.caption}</p>
                <div className="flex items-center text-white/80 text-xs space-x-2">
                    <Music2 className="w-3 h-3" />
                    <div className="overflow-hidden w-32">
                        <div className="whitespace-nowrap animate-marquee">Original Audio - {reel.username}</div>
                    </div>
                </div>
            </div>

            {/* Side Actions */}
            <div className="absolute bottom-4 right-2 flex flex-col items-center space-y-4">
                <button onClick={handleLike} className="flex flex-col items-center">
                    <Heart className={`w-7 h-7 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} strokeWidth={1.5} />
                    <span className="text-white text-xs mt-1">{likesCount}</span>
                </button>
                <button onClick={() => setShowComments(true)} className="flex flex-col items-center">
                    <MessageCircle className="w-7 h-7 text-white" strokeWidth={1.5} />
                    {/* <span className="text-white text-xs mt-1">{reel.comments || 0}</span> */}
                </button>
                <button onClick={() => setShowShare(true)} className="flex flex-col items-center">
                    <Send className="w-7 h-7 text-white -rotate-45 mb-1" strokeWidth={1.5} />
                </button>
                <button className="flex flex-col items-center">
                    <Bookmark className="w-7 h-7 text-white" strokeWidth={1.5} />
                </button>
                <button>
                    <MoreHorizontal className="w-7 h-7 text-white" strokeWidth={1.5} />
                </button>
                <div className="w-8 h-8 border border-white rounded overflow-hidden mt-2">
                     <img src={`https://ui-avatars.com/api/?name=${reel.username}&background=random`} className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Modals */}
            <CommentsDrawer 
                isOpen={showComments} 
                onClose={() => setShowComments(false)} 
                postId={reel.id} 
                postType="sfc" 
            />
            <ShareModal 
                isOpen={showShare} 
                onClose={() => setShowShare(false)} 
                post={{...reel, type: 'sfc'}} 
            />
        </div>
    );
}

export default function ReelsPage() {
  const [reels, setReels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    async function fetchReels() {
        const db = getFirestore();
        const sfcSnap = await getDocs(query(collection(db, 'sfc'), orderBy('createdAt', 'desc'), limit(10)));
        setReels(sfcSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    fetchReels();
  }, []);

  const handleScroll = () => {
      if (containerRef.current) {
          const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
          if (index !== activeIndex) setActiveIndex(index);
      }
  };

  return (
    <Layout>
      <div className="h-screen w-full flex justify-center bg-black">
        <div 
            ref={containerRef}
            onScroll={handleScroll}
            className="w-full max-w-md h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        >
            {reels.map((reel, idx) => (
                <div key={reel.id} className="h-full w-full snap-start pt-4 px-2">
                     <ReelItem reel={reel} isActive={idx === activeIndex} />
                </div>
            ))}
            {reels.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                    <Camera className="w-12 h-12 mb-4" />
                    <p>No reels yet.</p>
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
}
