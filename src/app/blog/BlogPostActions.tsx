"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id:          string;
  isPublished: boolean;
  slug:        string;
}

export default function BlogPostActions({ id, isPublished, slug }: Props) {
  const router  = useRouter();
  const [busy, setBusy] = useState(false);

  async function togglePublish() {
    setBusy(true);
    await fetch("/api/admin/blog", {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id, isPublished: !isPublished }),
    });
    router.refresh();
    setBusy(false);
  }

  async function deletePost() {
    if (!confirm("Delete this post permanently? This cannot be undone.")) return;
    setBusy(true);
    await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-1">
      <button onClick={togglePublish} disabled={busy}
        className={`btn btn-sm text-xs disabled:opacity-50 ${
          isPublished
            ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
            : "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
        }`}>
        {busy ? "…" : isPublished ? "Unpublish" : "Publish"}
      </button>
      <button onClick={deletePost} disabled={busy}
        className="btn btn-sm text-xs bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 disabled:opacity-50">
        🗑️
      </button>
    </div>
  );
}
