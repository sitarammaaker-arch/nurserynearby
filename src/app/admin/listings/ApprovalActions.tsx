"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  isActive: boolean;
  isPending: boolean;
  isFeatured: boolean;
  slug: string;
}

export default function ApprovalActions({ id, isActive, isPending, isFeatured, slug }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function doAction(action: string) {
    setLoading(action);
    try {
      const res = await fetch("/api/admin/nursery-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch (e) {
      alert("Action failed. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  const busy = (a: string) => loading === a;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Approve — show if pending */}
      {isPending && (
        <button
          onClick={() => doAction("approve")}
          disabled={!!loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold
                     bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition-all"
          title="Approve & make live"
        >
          {busy("approve") ? "…" : "✅ Approve"}
        </button>
      )}

      {/* Deactivate — show if active */}
      {isActive && !isPending && (
        <button
          onClick={() => doAction("deactivate")}
          disabled={!!loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold
                     bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50 transition-all"
          title="Remove from site"
        >
          {busy("deactivate") ? "…" : "❌ Deactivate"}
        </button>
      )}

      {/* Reactivate — show if inactive and not pending */}
      {!isActive && !isPending && (
        <button
          onClick={() => doAction("approve")}
          disabled={!!loading}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold
                     bg-forest-50 text-forest border border-forest-200 hover:bg-forest hover:text-white disabled:opacity-50 transition-all"
          title="Make live again"
        >
          {busy("approve") ? "…" : "♻️ Activate"}
        </button>
      )}

      {/* Feature toggle */}
      <button
        onClick={() => doAction(isFeatured ? "unfeature" : "feature")}
        disabled={!!loading}
        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-50 ${
          isFeatured
            ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-amber-50 hover:text-amber-700"
        }`}
        title={isFeatured ? "Remove featured" : "Mark as featured"}
      >
        {busy("feature") || busy("unfeature") ? "…" : isFeatured ? "⭐" : "☆"}
      </button>

      {/* View on site */}
      <a
        href={`/listing/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 transition-all"
        title="View on site"
      >
        🔗
      </a>
    </div>
  );
}
