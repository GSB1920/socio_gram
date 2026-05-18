import dynamic from "next/dynamic";

const CreateBlog = dynamic(() => import("../pages/post/blog"), { ssr: false });
const SFCPage = dynamic(() => import("../pages/post/sfc"), { ssr: false });
const StaticImagePage = dynamic(() => import("../pages/post/staticImage"), {
  ssr: false,
});

export default function CreateModals({ activeModal, onClose }) {
  if (!activeModal) return null;

  const content =
    activeModal === "blog" ? (
      <CreateBlog />
    ) : activeModal === "sfc" ? (
      <SFCPage />
    ) : activeModal === "image" ? (
      <StaticImagePage />
    ) : null;

  if (!content) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
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
          {content}
        </div>
      </div>
    </div>
  );
}
