import { useState } from "react";
import dynamic from "next/dynamic";
import Layout from "../components/Layout";
import Feed from "../components/Feed";

const CreateBlog = dynamic(() => import("./post/blog"), { ssr: false });
const SFCPage = dynamic(() => import("./post/sfc"), { ssr: false });
const StaticImagePage = dynamic(() => import("./post/staticImage"), { ssr: false });

export default function HomePage() {
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showSFCModal, setShowSFCModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleCreateClick = (type) => {
    if (type === 'blog') setShowBlogModal(true);
    if (type === 'sfc') setShowSFCModal(true);
    if (type === 'image') setShowImageModal(true);
  };

  return (
    <Layout onCreateClick={handleCreateClick}>
      <Feed />

      {/* Modals */}
      {showBlogModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl">
            <button
              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
              onClick={() => setShowBlogModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto">
              <CreateBlog />
            </div>
          </div>
        </div>
      )}

      {showSFCModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl">
            <button
              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
              onClick={() => setShowSFCModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto">
              <SFCPage />
            </div>
          </div>
        </div>
      )}

      {showImageModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl">
            <button
              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
              onClick={() => setShowImageModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto">
              <StaticImagePage />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
