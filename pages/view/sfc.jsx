import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import "../../lib/firebase";
import SFCTile from "../tile/sfc";

export default function SFCViewPage() {
  const [sfcs, setSfcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSFCs() {
      setLoading(true);
      setError("");
      try {
        const db = getFirestore();
        const sfcRef = collection(db, "sfc");
        const q = query(sfcRef, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        const items = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSfcs(items);
      } catch (err) {
        console.error("Error fetching SFCs:", err);
        setError("Failed to load videos. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchSFCs();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-10">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-black dark:text-zinc-50">
          Short Form Content
        </h1>

        {loading && (
          <p className="text-zinc-600 dark:text-zinc-400">Loading videos...</p>
        )}

        {error && (
          <div className="mb-4 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {!loading && !error && sfcs.length === 0 && (
          <p className="text-zinc-600 dark:text-zinc-400">
            No short videos have been uploaded yet.
          </p>
        )}

        <div className="flex flex-col gap-4">
          {sfcs.map((sfc) => (
            <SFCTile key={sfc.id} sfc={sfc} />
          ))}
        </div>
      </div>
    </div>
  );
}