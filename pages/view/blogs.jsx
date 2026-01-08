import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import "../../lib/firebase";
import BlogTile from "../tile/blogs";

export default function BlogsViewPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      setError("");
      try {
        const db = getFirestore();
        const blogsRef = collection(db, "blogs");
        const q = query(blogsRef, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        const items = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBlogs(items);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blogs. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-black dark:text-zinc-50">
          Blogs
        </h1>

        {loading && (
          <p className="text-zinc-600 dark:text-zinc-400">Loading blogs...</p>
        )}

        {error && (
          <div className="mb-4 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {!loading && !error && blogs.length === 0 && (
          <p className="text-zinc-600 dark:text-zinc-400">
            No blogs have been posted yet.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {blogs.map((blog) => (
            <BlogTile key={blog.id} blog={blog} />
          ))}
        </div>
      </div>
    </div>
  );
}