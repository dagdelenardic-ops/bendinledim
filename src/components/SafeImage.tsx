"use client";

import Image, { type ImageProps } from "next/image";
import { useMemo, useState } from "react";

type SafeImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
};

export default function SafeImage({
  src,
  alt,
  fallbackSrc = "/placeholder.svg",
  onError,
  ...props
}: SafeImageProps) {
  const initial = useMemo(() => {
    const s = String(src || "").trim();
    return s || fallbackSrc;
  }, [src, fallbackSrc]);

  const [currentSrc, setCurrentSrc] = useState<string>(initial);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(e) => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
        onError?.(e);
      }}
    />
  );
}
