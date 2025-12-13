import { useState, useRef } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/router";
import { useUser } from "@/contexts/UserContext";
import "../../lib/firebase";

export default function StaticImagePage() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const imageRef = useRef(null);

  const { user } = useUser();
  const router = useRouter();
  const db = getFirestore();
  const storage = getStorage();

  // Redirect if not logged in
  if (typeof window !== "undefined" && !user) {
    router.push("/signIn");
    return null;
  }

  function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's an image file
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setError("");
    setImageFile(file);

    // Create preview URL
    const previewURL = URL.createObjectURL(file);
    setImagePreview(previewURL);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!user) {
      setError("You must be logged in to upload an image.");
      setLoading(false);
      return;
    }

    if (!imageFile) {
      setError("Please select an image file.");
      setLoading(false);
      return;
    }

    if (!caption.trim()) {
      setError("Please enter a caption.");
      setLoading(false);
      return;
    }

    try {
      // Upload image to Firebase Storage
      const timestamp = Date.now();
      const fileName = `staticImages/${user.username}_${timestamp}_${imageFile.name}`;
      const storageRef = ref(storage, fileName);

      setSuccess("Uploading image...");
      await uploadBytes(storageRef, imageFile);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Save to Firestore
      const now = new Date();
      const staticImageRef = collection(db, "staticImage");

      await addDoc(staticImageRef, {
        staticImageLink: downloadURL,
        caption: caption.trim(),
        likeCount: 0,
        comments: [],
        username: user.username,
        timestamp: now.getTime(),
        date: now.toISOString(),
        createdAt: Date.now(),
      });

      setSuccess("Image uploaded successfully!");
      setCaption("");
      setImageFile(null);
      setImagePreview(null);
      
      // Reset file input
      if (imageRef.current) {
        imageRef.current.value = "";
      }

      // Optionally redirect after a delay
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
      console.error("Error uploading image:", err);
    }
    setLoading(false);
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black py-8">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-black dark:text-zinc-50">
          Upload Static Image
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-2 text-black dark:text-zinc-50">
              Image
            </label>
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="block w-full text-sm text-zinc-500 dark:text-zinc-400
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                dark:file:bg-zinc-800 dark:file:text-zinc-200"
              required
            />
          </div>

          {imagePreview && (
            <div className="w-full">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-96 object-contain rounded border border-zinc-300 dark:border-zinc-700"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-black dark:text-zinc-50">
              Caption
            </label>
            <textarea
              className="w-full px-4 py-2 border border-zinc-400 rounded min-h-[100px] dark:bg-zinc-800 dark:text-zinc-50"
              placeholder="Write a caption for your image..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
              {success}
            </div>
          )}

          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading || !imageFile || !caption.trim()}
            type="submit"
          >
            {loading ? "Uploading..." : "Upload Image"}
          </button>
        </form>
      </div>
    </div>
  );
}