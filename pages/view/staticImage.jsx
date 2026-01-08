import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import "../../lib/firebase";
import StaticImageTile from "../tile/staticImage";

export default function StaticImagesViewPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      setError("");
      try {
        const db = getFirestore();
        // Collection name matches what you used in the upload component
        const staticImageRef = collection(db, "staticImage");
        const q = query(staticImageRef, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        const items = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setImages(items);
      } catch (err) {
        console.error("Error fetching static images:", err);
        setError("Failed to load images. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-black dark:text-zinc-50">
          Static Images
        </h1>

        {loading && (
          <p className="text-zinc-600 dark:text-zinc-400">Loading images...</p>
        )}

        {error && (
          <div className="mb-4 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {!loading && !error && images.length === 0 && (
          <p className="text-zinc-600 dark:text-zinc-400">
            No images have been uploaded yet.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {images.map((img) => (
            <StaticImageTile key={img.id} item={img} />
          ))}
        </div>
      </div>
    </div>
  );
} 