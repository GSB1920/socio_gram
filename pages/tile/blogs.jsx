import Link from "next/link";

export default function BlogTile({ blog }) {
  const createdAt =
    blog.date
      ? new Date(blog.date)
      : blog.timestamp
      ? new Date(blog.timestamp)
      : null;

  return (
    <article className="w-full border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900 shadow-sm">
      <header className="mb-2">
        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
          {blog.title}
        </h2>
        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          <span>by @{blog.username}</span>
          {createdAt && (
            <>
              <span className="mx-1">•</span>
              <span>{createdAt.toLocaleString()}</span>
            </>
          )}
        </div>
      </header>

      <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-3">
        {blog.caption || blog.body?.slice(0, 150)}
        {blog.body && blog.body.length > 150 ? "…" : ""}
      </p>

      <footer className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <div>
          <span className="font-semibold">{blog.likeCount ?? 0}</span> likes
          <span className="mx-1">•</span>
          <span className="font-semibold">
            {blog.comments ? blog.comments.length : 0}
          </span>{" "}
          comments
        </div>

        {/* Optional: link to a detailed blog page if you add one later */}
        {/* <Link href={`/view/blog/${blog.id}`} className="text-blue-600 hover:underline">
          Read more
        </Link> */}
      </footer>
    </article>
  );
}