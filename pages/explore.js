import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Search } from "lucide-react";
import Layout from "../components/Layout";
import "../lib/firebase";

export default function ExplorePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    async function fetchExploreContent() {
      const db = getFirestore();
      try {
        const limitCount = 20;

        const [blogsSnap, sfcSnap, imgSnap] = await Promise.all([
          getDocs(
            query(
              collection(db, "blogs"),
              orderBy("createdAt", "desc"),
              limit(limitCount)
            )
          ),
          getDocs(
            query(
              collection(db, "sfc"),
              orderBy("createdAt", "desc"),
              limit(limitCount)
            )
          ),
          getDocs(
            query(
              collection(db, "staticImage"),
              orderBy("createdAt", "desc"),
              limit(limitCount)
            )
          ),
        ]);

        const blogs = blogsSnap.docs.map((d) => ({
          id: d.id,
          type: "blog",
          ...d.data(),
        }));
        const sfcs = sfcSnap.docs.map((d) => ({
          id: d.id,
          type: "sfc",
          ...d.data(),
        }));
        const images = imgSnap.docs.map((d) => ({
          id: d.id,
          type: "image",
          ...d.data(),
        }));

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

  const toggleVideo = (id, videoEl) => {
    if (!videoEl) return;
    if (playingId === id) {
      videoEl.pause();
      setPlayingId(null);
    } else {
      videoEl.play().catch(() => {});
      setPlayingId(id);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-full px-2 py-3 md:mx-auto md:max-w-3xl md:px-4 lg:max-w-5xl lg:py-4">
        <div className="relative mb-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-lg bg-zinc-100 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:bg-zinc-800 dark:focus:ring-zinc-700"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-600" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-500">
            No content to explore yet.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
            {items.map((item, idx) => {
              const isLarge = idx % 10 === 0;
              const isTall = idx % 10 === 3;

              let spanClass = "";
              if (isLarge) spanClass = "md:col-span-2 md:row-span-2";
              else if (isTall) spanClass = "md:row-span-2";

              return (
                <div
                  key={item.id}
                  className={`group relative aspect-square overflow-hidden bg-zinc-200 dark:bg-zinc-800 ${spanClass}`}
                >
                  {item.type === "image" && (
                    <img
                      src={item.staticImageLink || item.imageUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  {item.type === "sfc" && (
                    <video
                      src={item.videoUrl}
                      className="h-full w-full cursor-pointer object-cover"
                      muted
                      loop
                      playsInline
                      onClick={(e) => toggleVideo(item.id, e.currentTarget)}
                    />
                  )}
                  {item.type === "blog" && (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4 text-center text-sm">
                      <p className="line-clamp-6 font-serif">{item.title || item.body || item.content}</p>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/40" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
