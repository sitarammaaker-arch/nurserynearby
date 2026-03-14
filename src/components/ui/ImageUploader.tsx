"use client";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface UploadedImage {
  url:       string;
  publicId:  string;
  thumbnail: string;
}

interface Props {
  value?:      UploadedImage[];
  onChange?:   (images: UploadedImage[]) => void;
  maxImages?:  number;
  folder?:     string;
  label?:      string;
}

export default function ImageUploader({
  value     = [],
  onChange,
  maxImages = 5,
  folder    = "nurseries",
  label     = "Upload Photos",
}: Props) {
  const [images,    setImages]    = useState<UploadedImage[]>(value);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [dragOver,  setDragOver]  = useState(false);
  const [error,     setError]     = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File): Promise<UploadedImage | null> => {
    const fd = new FormData();
    fd.append("file",   file);
    fd.append("folder", folder);

    const res  = await fetch("/api/upload-image", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    return { url: data.url, publicId: data.publicId, thumbnail: data.thumbnail };
  }, [folder]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");

    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    setProgress(0);

    const uploaded: UploadedImage[] = [];
    for (let i = 0; i < toUpload.length; i++) {
      try {
        const result = await uploadFile(toUpload[i]);
        if (result) uploaded.push(result);
        setProgress(Math.round(((i + 1) / toUpload.length) * 100));
      } catch (e: any) {
        setError(e.message);
      }
    }

    const newImages = [...images, ...uploaded];
    setImages(newImages);
    onChange?.(newImages);
    setUploading(false);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  }, [images, maxImages, uploadFile, onChange]);

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onChange?.(newImages);
  };

  const moveImage = (from: number, to: number) => {
    const newImages = [...images];
    [newImages[from], newImages[to]] = [newImages[to], newImages[from]];
    setImages(newImages);
    onChange?.(newImages);
  };

  const canUploadMore = images.length < maxImages && !uploading;

  return (
    <div className="space-y-3">
      {label && <label className="label">{label}</label>}

      {/* Uploaded images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div key={img.publicId ?? i}
              className={`relative group rounded-xl overflow-hidden aspect-[4/3] bg-gray-100 border-2 ${i === 0 ? "border-forest" : "border-transparent"}`}>
              <Image src={img.thumbnail || img.url} alt={`Upload ${i + 1}`} fill className="object-cover"/>

              {/* Primary badge */}
              {i === 0 && (
                <div className="absolute top-2 left-2">
                  <span className="badge badge-green text-2xs">✓ Primary</span>
                </div>
              )}

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {i > 0 && (
                  <button type="button" onClick={() => moveImage(i, i - 1)} title="Move left"
                    className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors text-sm font-bold">
                    ←
                  </button>
                )}
                <button type="button" onClick={() => removeImage(i)} title="Remove"
                  className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
                {i < images.length - 1 && (
                  <button type="button" onClick={() => moveImage(i, i + 1)} title="Move right"
                    className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors text-sm font-bold">
                    →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {canUploadMore && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-forest bg-forest-50 scale-[1.01]"
              : "border-gray-200 hover:border-forest-300 hover:bg-gray-50"
          } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
            multiple className="hidden"
            onChange={(e) => handleFiles(e.target.files)}/>

          {uploading ? (
            <div className="space-y-3">
              <div className="text-3xl">⏳</div>
              <p className="font-semibold text-forest text-sm">Uploading… {progress}%</p>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden max-w-xs mx-auto">
                <div className="h-full gradient-forest rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}/>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl">📸</div>
              <p className="font-semibold text-gray-700 text-sm">
                Drop images here or <span className="text-forest underline">browse</span>
              </p>
              <p className="text-xs text-gray-400">
                JPG, PNG, WebP · Max 5MB per image · {maxImages - images.length} more allowed
              </p>
              {images.length === 0 && (
                <p className="text-2xs text-gray-400 mt-1">First image will be used as the primary/cover photo</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Max reached message */}
      {images.length >= maxImages && !uploading && (
        <p className="text-xs text-center text-gray-400 bg-gray-50 rounded-xl py-2">
          Maximum {maxImages} images reached · Remove one to add more
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-red-500 shrink-0">⚠️</span>
          <p className="text-red-700 text-xs font-medium">{error}</p>
          <button type="button" onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Info tip */}
      {images.length > 0 && (
        <p className="text-2xs text-gray-400 text-center">
          💡 Hover over images to reorder or remove · First image = cover photo
        </p>
      )}
    </div>
  );
}
