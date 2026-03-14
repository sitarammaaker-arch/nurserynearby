"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import ImageUploader from "@/components/ui/ImageUploader";

interface Photo { id: string; url: string; isPrimary: boolean; alt?: string }
interface Props  { nurseryId: string; nurseryName: string }

export default function NurseryPhotoManager({ nurseryId, nurseryName }: Props) {
  const [photos,  setPhotos]  = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState("");

  useEffect(() => {
    fetch(`/api/nursery-photos?nurseryId=${nurseryId}`)
      .then((r) => r.json())
      .then((d) => { setPhotos(d.photos ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [nurseryId]);

  async function handleNewImages(imgs: { url: string; publicId: string; thumbnail: string }[]) {
    setSaving(true);
    try {
      const res = await fetch("/api/nursery-photos", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          nurseryId,
          photos: imgs.map((img, i) => ({
            url:       img.url,
            isPrimary: photos.length === 0 && i === 0,
            alt:       nurseryName,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPhotos((p) => [...p, ...data.created]);
        setMsg("✅ Photos saved!");
        setTimeout(() => setMsg(""), 3000);
      }
    } catch { setMsg("❌ Failed to save photos"); }
    finally { setSaving(false); }
  }

  async function setPrimary(photoId: string) {
    await fetch("/api/nursery-photos", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "setPrimary", photoId, nurseryId }),
    });
    setPhotos((p) => p.map((ph) => ({ ...ph, isPrimary: ph.id === photoId })));
  }

  async function deletePhoto(photoId: string) {
    if (!confirm("Delete this photo?")) return;
    await fetch("/api/nursery-photos", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ action: "delete", photoId }),
    });
    setPhotos((p) => p.filter((ph) => ph.id !== photoId));
  }

  if (loading) return <div className="text-center py-8 text-gray-400">Loading photos…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-forest-900">Manage Photos</h3>
        {msg && <span className="text-sm font-medium text-green-700">{msg}</span>}
      </div>

      {/* Existing photos */}
      {photos.length > 0 && (
        <div>
          <p className="label mb-3">Current Photos ({photos.length})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className={`relative group rounded-xl overflow-hidden aspect-[4/3] border-2 ${photo.isPrimary ? "border-forest" : "border-gray-200"}`}>
                <Image src={photo.url} alt={photo.alt ?? nurseryName} fill className="object-cover"/>
                {photo.isPrimary && (
                  <div className="absolute top-2 left-2">
                    <span className="badge badge-green text-2xs">✓ Primary</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  {!photo.isPrimary && (
                    <button onClick={() => setPrimary(photo.id)}
                      className="w-full py-1.5 rounded-lg bg-forest text-white text-xs font-bold hover:bg-forest-700">
                      Set as Primary
                    </button>
                  )}
                  <button onClick={() => deletePhoto(photo.id)}
                    className="w-full py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload new */}
      <div>
        <p className="label mb-3">Add New Photos</p>
        <ImageUploader
          value={[]}
          onChange={handleNewImages}
          maxImages={5 - photos.length}
          folder={`nurseries/${nurseryId}`}
          label=""
        />
      </div>
    </div>
  );
}
