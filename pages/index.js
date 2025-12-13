import { useState } from "react";

// Dynamically import the CreateBlog, SFCPage, and StaticImagePage components so they don't SSR by default (important for Next.js + modals)
import dynamic from "next/dynamic";
const CreateBlog = dynamic(() => import("./post/blog"), { ssr: false });
const SFCPage = dynamic(() => import("./post/sfc"), { ssr: false });
const StaticImagePage = dynamic(() => import("./post/staticImage"), { ssr: false });

export default function HomePage() {
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showSFCModal, setShowSFCModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
      <div className="flex flex-row space-x-4 mb-6">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => setShowBlogModal(true)}
        >
          Add Blog
        </button>
        <button
          className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          onClick={() => setShowSFCModal(true)}
        >
          Add SFC
        </button>
        <button
          className="px-6 py-3 bg-yellow-600 text-white rounded-lg shadow hover:bg-yellow-700 transition"
          onClick={() => setShowImageModal(true)}
        >
          Add Image
        </button>
      </div>

      {/* Blog Modal */}
      {showBlogModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative w-full max-w-2xl">
            <button
              className="absolute -right-3 -top-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-red-600"
              onClick={() => setShowBlogModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-0">
              <CreateBlog />
            </div>
          </div>
        </div>
      )}

      {/* SFC Modal */}
      {showSFCModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative w-full max-w-2xl">
            <button
              className="absolute -right-3 -top-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-red-600"
              onClick={() => setShowSFCModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-0">
              <SFCPage />
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-40">
          <div className="relative w-full max-w-2xl">
            <button
              className="absolute -right-3 -top-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-red-600"
              onClick={() => setShowImageModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-0">
              <StaticImagePage />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
