'use client';

import { useState, useEffect } from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { getSafeImageUrl } from '../../utils/imageUtils';

interface ImageProps extends Omit<NextImageProps, 'src' | 'onError'> {
  src: string | null | undefined;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function Image({
  src,
  alt,
  className = '',
  fallbackSrc = '/images/placeholder-shower.svg',
  ...props
}: ImageProps) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Set initial source after component mounts to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    setImgSrc(getSafeImageUrl(src, fallbackSrc));
  }, [src, fallbackSrc]);

  // Handle image loading errors
  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Don't render anything during SSR or before the component is mounted
  if (!isMounted) {
    return (
      <div 
        className={`relative bg-gray-100 animate-pulse ${className}`}
        style={{
          width: props.width,
          height: props.height,
          ...(props.fill && { position: 'absolute', inset: 0 })
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <NextImage
      {...props}
      src={imgSrc}
      alt={alt}
      className={`object-cover ${className}`}
      onError={handleError}
      // Only use unoptimized for data URLs
      unoptimized={imgSrc.startsWith('data:')}
      // Add proper loading strategy
      loading={props.priority ? 'eager' : 'lazy'}
    />
  );
}
