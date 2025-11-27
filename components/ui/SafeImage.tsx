/**
 * Safe Image Component with Error Handling
 * 
 * Wraps Next.js Image component with error handling for certificate issues
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { getFallbackImage } from "@/lib/utils/imageLoader";

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  onError?: () => void;
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  sizes,
  priority,
  quality,
  onError,
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== getFallbackImage()) {
      console.warn(`Image failed to load: ${imgSrc}, using fallback`);
      setImgSrc(getFallbackImage());
      setHasError(true);
      onError?.();
    }
  };

  const imageProps: any = {
    src: imgSrc,
    alt,
    className,
    onError: handleError,
    ...(sizes && { sizes }),
    ...(priority && { priority }),
    ...(quality && { quality }),
  };

  if (fill) {
    return <Image {...imageProps} fill />;
  }

  return (
    <Image
      {...imageProps}
      width={width || 300}
      height={height || 300}
    />
  );
}

