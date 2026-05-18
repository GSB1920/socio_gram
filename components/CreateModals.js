import { useState } from "react";
import dynamic from "next/dynamic";

const CreateBlog = dynamic(() => import("../pages/post/blog"), { ssr: false });
const SFCPage = dynamic(() => import("../pages/post/sfc"), { ssr: false });
const StaticImagePage = dynamic(() => import("../pages/post/staticImage"), {
  ssr: false,
});

function ModalShell({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl">
        <button
          type="button"
          className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-lg dark:bg-zinc-900">
          {children}
        </div>
      </div>
    </div>
  );
}

export function useCreateModals() {
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [showSFCModal, setShowSFCModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleCreateClick = (type) => {
    if (type === "blog") setShowBlogModal(true);
    if (type === "sfc") setShowSFCModal(true);
    if (type === "image") setShowImageModal(true);
  };

  const modals = (
    <>
      <ModalShell open={showBlogModal} onClose={() => setShowBlogModal(false)}>
        <CreateBlog />
      </ModalShell>
      <ModalShell open={showSFCModal} onClose={() => setShowSFCModal(false)}>
        <SFCPage />
      </ModalShell>
      <ModalShell open={showImageModal} onClose={() => setShowImageModal(false)}>
        <StaticImagePage />
      </ModalShell>
    </>
  );

  return { handleCreateClick, modals };
}
