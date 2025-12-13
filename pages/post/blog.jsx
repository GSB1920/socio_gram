import { useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useUser } from "@/contexts/UserContext";
import "../../lib/firebase";

export default function BlogPage() {
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    caption: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { user } = useUser();
  const router = useRouter();
  const db = getFirestore();

  // Redirect if not logged in
  if (typeof window !== "undefined" && !user) {
    router.push("/signIn");
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!user) {
      setError("You must be logged in to create a blog.");
      setLoading(false);
      return;
    }

    if (!formData.title || !formData.body || !formData.caption) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const blogsRef = collection(db, "blogs");
      const now = new Date();
      
      await addDoc(blogsRef, {
        title: formData.title,
        body: formData.body,
        caption: formData.caption,
        likeCount: 0,
        comments: [],
        username: user.username,
        timestamp: now.getTime(),
        date: now.toISOString(),
        createdAt: Date.now(),
      });

      setSuccess("Blog posted successfully!");
      setFormData({ title: "", body: "", caption: "" });
      
      // Optionally redirect after a delay
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      setError("Failed to post blog. Please try again.");
      console.error("Error posting blog:", err);
    }
    setLoading(false);
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-black dark:text-zinc-50">
          Create a New Blog Post
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            className="px-4 py-2 border border-zinc-400 rounded dark:bg-zinc-800 dark:text-zinc-50"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <textarea
            className="px-4 py-2 border border-zinc-400 rounded min-h-[200px] dark:bg-zinc-800 dark:text-zinc-50"
            placeholder="Body"
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            required
          />

          <input
            type="text"
            className="px-4 py-2 border border-zinc-400 rounded dark:bg-zinc-800 dark:text-zinc-50"
            placeholder="Caption"
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            required
          />

          {error && <div className="text-red-600">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}

          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Posting..." : "Post Blog"}
          </button>
        </form>
      </div>
    </div>
  );
}