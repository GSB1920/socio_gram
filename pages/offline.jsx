import Head from "next/head";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <>
      <Head>
        <title>Offline · Sociogram</title>
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-zinc-100">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 ring-1 ring-zinc-800">
          <span className="text-2xl font-semibold tracking-tight text-white">
            S
          </span>
        </div>
        <h1 className="text-xl font-semibold text-white">You&apos;re offline</h1>
        <p className="mt-2 max-w-sm text-sm text-zinc-400">
          Check your connection and try again. Cached pages may still be
          available once you&apos;re back online.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          Go home
        </Link>
      </div>
    </>
  );
}
