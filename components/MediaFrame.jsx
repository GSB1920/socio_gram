const VARIANT_CLASSES = {
  feed: "w-full aspect-[4/5] max-h-[min(70dvh,580px)] overflow-hidden rounded-sm border border-zinc-100 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900",
  square: "relative w-full aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-900",
  reel: "relative w-full aspect-[9/16] max-h-[70dvh] overflow-hidden bg-black",
  contain:
    "flex w-full max-h-[70dvh] items-center justify-center overflow-hidden rounded-sm bg-black",
};

export default function MediaFrame({ variant = "feed", className = "", children }) {
  const base = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.feed;

  return (
    <div className={`${base} ${className}`.trim()}>
      {children}
    </div>
  );
}
