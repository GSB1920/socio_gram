import { useState, useRef } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/router";
import { useUser } from "@/contexts/UserContext";
import "../../lib/firebase";

export default function SFCPage() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [videoDuration, setVideoDuration] = useState(null);
  const videoRef = useRef(null);

  const { user } = useUser();
  const router = useRouter();
  const db = getFirestore();
  const storage = getStorage();

  // Redirect if not logged in
  if (typeof window !== "undefined" && !user) {
    router.push("/signIn");
    return null;
  }

  function handleVideoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's a video file
    if (!file.type.startsWith("video/")) {
      setError("Please select a video file.");
      return;
    }

    setError("");
    setVideoFile(file);

    // Create preview URL
    const previewURL = URL.createObjectURL(file);
    setVideoPreview(previewURL);

    // Check video duration
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(previewURL);
      const duration = video.duration;
      setVideoDuration(duration);

      if (duration > 60) {
        setError("Video must be under 60 seconds. Your video is " + Math.round(duration) + " seconds long.");
        setVideoFile(null);
        setVideoPreview(null);
        setVideoDuration(null);
        e.target.value = ""; // Reset file input
      }
    };
    video.src = previewURL;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!user) {
      setError("You must be logged in to upload SFC.");
      setLoading(false);
      return;
    }

    if (!videoFile) {
      setError("Please select a video file.");
      setLoading(false);
      return;
    }

    if (!caption.trim()) {
      setError("Please enter a caption.");
      setLoading(false);
      return;
    }

    // Double-check duration before upload
    if (videoDuration && videoDuration > 60) {
      setError("Video must be under 60 seconds. Please select a shorter video.");
      setLoading(false);
      return;
    }

    try {
      // Upload video to Firebase Storage
      const timestamp = Date.now();
      const fileName = `sfc/${user.username}_${timestamp}_${videoFile.name}`;
      const storageRef = ref(storage, fileName);

      setSuccess("Uploading video...");
      await uploadBytes(storageRef, videoFile);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Save to Firestore
      const now = new Date();
      const sfcRef = collection(db, "sfc");

      await addDoc(sfcRef, {
        sfcLink: downloadURL,
        caption: caption.trim(),
        likeCount: 0,
        comments: [],
        username: user.username,
        timestamp: now.getTime(),
        date: now.toISOString(),
        createdAt: Date.now(),
        duration: videoDuration,
      });

      setSuccess("SFC uploaded successfully!");
      setCaption("");
      setVideoFile(null);
      setVideoPreview(null);
      setVideoDuration(null);
      
      // Reset file input
      if (videoRef.current) {
        videoRef.current.value = "";
      }

      // Optionally redirect after a delay
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      setError("Failed to upload SFC. Please try again.");
      console.error("Error uploading SFC:", err);
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
          Upload Short Form Content
        </h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-2 text-black dark:text-zinc-50">
              Video (Max 60 seconds)
            </label>
            <input
              ref={videoRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="block w-full text-sm text-zinc-500 dark:text-zinc-400
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                dark:file:bg-zinc-800 dark:file:text-zinc-200"
              required
            />
            {videoDuration && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Duration: {Math.round(videoDuration)} seconds
              </p>
            )}
          </div>

          {videoPreview && (
            <div className="w-full">
              <video
                src={videoPreview}
                controls
                className="w-full max-h-96 rounded border border-zinc-300 dark:border-zinc-700"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-black dark:text-zinc-50">
              Caption
            </label>
            <textarea
              className="w-full px-4 py-2 border border-zinc-400 rounded min-h-[100px] dark:bg-zinc-800 dark:text-zinc-50"
              placeholder="Write a caption for your SFC..."
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
            disabled={loading || !videoFile || !caption.trim()}
            type="submit"
          >
            {loading ? "Uploading..." : "Upload SFC"}
          </button>
        </form>
      </div>
    </div>
  );
}