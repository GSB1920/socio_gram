import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import "../../lib/firebase";
import { useUser } from "@/contexts/UserContext";

import BlogTile from "../tile/blogs";
import SFCTile from "../tile/sfc";
import StaticImageTile from "../tile/staticImage";

export default function MyContentPage() {
  const { user, loading: userLoading } = useUser();
  const [blogs, setBlogs] = useState([]);
  const [sfcs, setSfcs] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setError("You must be logged in to view your content.");
      setLoading(false);
      return;
    }

    async function fetchMyContent() {
      setLoading(true);
      setError("");
      try {
        const db = getFirestore();

        const blogsRef = collection(db, "blogs");
        const blogsQ = query(
          blogsRef,
          where("username", "==", user.username),
          orderBy("createdAt", "desc")
        );
        const blogsSnap = await getDocs(blogsQ);
        setBlogs(blogsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        const sfcRef = collection(db, "sfc");
        const sfcQ = query(
          sfcRef,
          where("username", "==", user.username),
          orderBy("createdAt", "desc")
        );
        const sfcSnap = await getDocs(sfcQ);
        setSfcs(sfcSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        const staticImageRef = collection(db, "staticImage");
        const staticImageQ = query(
          staticImageRef,
          where("username", "==", user.username),
          orderBy("createdAt", "desc")
        );
        const staticImageSnap = await getDocs(staticImageQ);
        setImages(staticImageSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching my content:", err);
        setError("Failed to load your content. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchMyContent();
  }, [user, userLoading]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Loading user...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2 text-black dark:text-zinc-50">
          My Content
        </h1>
        {user && (
          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
            Showing posts for <span className="font-semibold">@{user.username}</span>
          </p>
        )}

        {loading && (
          <p className="text-zinc-600 dark:text-zinc-400">Loading your content...</p>
        )}

        {error && (
          <div className="mb-4 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {!loading && !error && user && (
          <div className="space-y-8">
            {/* Blogs */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-black dark:text-zinc-50">
                Blogs
              </h2>
              {blogs.length === 0 ? (
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  You haven't posted any blogs yet.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {blogs.map((blog) => (
                    <BlogTile key={blog.id} blog={blog} />
                  ))}
                </div>
              )}
            </section>

            {/* Short Form Content */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-black dark:text-zinc-50">
                Short Form Content
              </h2>
              {sfcs.length === 0 ? (
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  You haven't uploaded any short videos yet.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {sfcs.map((sfc) => (
                    <SFCTile key={sfc.id} sfc={sfc} />
                  ))}
                </div>
              )}
            </section>

            {/* Static Images */}
            <section>
              <h2 className="text-2xl font-semibold mb-3 text-black dark:text-zinc-50">
                Static Images
              </h2>
              {images.length === 0 ? (
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  You haven't uploaded any images yet.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {images.map((img) => (
                    <StaticImageTile key={img.id} item={img} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}