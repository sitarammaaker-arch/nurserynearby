"use client";
import { useState } from "react";

interface Props {
  src:       string;
  alt:       string;
  className?: string;
}

export default function NurseryImage({ src, alt, className }: Props) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-forest-50 to-sage-50">
        <span className="text-5xl opacity-20">🌱</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}
