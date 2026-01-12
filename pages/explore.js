import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Search } from "lucide-react";
import Layout from "../components/Layout";
import "../lib/firebase";

export default function ExplorePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExploreContent() {
      const db = getFirestore();
      try {
        const limitCount = 20;
        
        // Fetch mixed content
        const [blogsSnap, sfcSnap, imgSnap] = await Promise.all([
            getDocs(query(collection(db, 'blogs'), orderBy('createdAt', 'desc'), limit(limitCount))),
            getDocs(query(collection(db, 'sfc'), orderBy('createdAt', 'desc'), limit(limitCount))),
            getDocs(query(collection(db, 'staticImage'), orderBy('createdAt', 'desc'), limit(limitCount)))
        ]);

        const blogs = blogsSnap.docs.map(d => ({ id: d.id, type: 'blog', ...d.data() }));
        const sfcs = sfcSnap.docs.map(d => ({ id: d.id, type: 'sfc', ...d.data() }));
        const images = imgSnap.docs.map(d => ({ id: d.id, type: 'image', ...d.data() }));

        // Shuffle
        const all = [...blogs, ...sfcs, ...images].sort(() => 0.5 - Math.random());
        setItems(all);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchExploreContent();
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-4 px-4">
        {/* Search Bar */}
        <div className="mb-6 relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-400" />
             </div>
             <input 
                type="text" 
                placeholder="Search" 
                className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700"
             />
        </div>

        {/* Masonry Grid Simulation */}
        <div className="grid grid-cols-3 gap-1 auto-rows-[120px] md:auto-rows-[250px]">
            {items.map((item, idx) => {
                // Make some items span 2 rows/cols for "Pinterest/Instagram" layout feel
                const isLarge = idx % 10 === 0; 
                const isTall = idx % 10 === 3;
                
                let spanClass = "";
                if (isLarge) spanClass = "col-span-2 row-span-2";
                else if (isTall) spanClass = "row-span-2";

                return (
                    <div key={item.id} className={`relative group bg-zinc-200 dark:bg-zinc-800 overflow-hidden ${spanClass}`}>
                         {item.type === 'image' && (
                             <img src={item.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                         )}
                         {item.type === 'sfc' && (
                             <video src={item.videoUrl} className="w-full h-full object-cover" muted loop onMouseOver={e => e.target.play()} onMouseOut={e => e.target.pause()} />
                         )}
                         {item.type === 'blog' && (
                             <div className="w-full h-full p-4 flex items-center justify-center text-center text-sm bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                                <p className="line-clamp-6 font-serif">{item.content}</p>
                             </div>
                         )}
                         
                         {/* Hover Overlay */}
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    </div>
                );
            })}
        </div>
      </div>
    </Layout>
  );
}
