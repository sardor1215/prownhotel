import { StaticImageData } from 'next/image';
// Using a simple string path for the placeholder since it's in the public folder
const PLACEHOLDER_IMAGE_PATH = '/images/placeholder-shower.svg';

/**
 * Get a safe image URL with fallback to placeholder
 * @param url The image URL to check
 * @param fallback Optional fallback image (defaults to placeholder)
 * @returns A safe image URL
 */
export const getSafeImageUrl = (url?: string | null, fallback: string = PLACEHOLDER_IMAGE_PATH): string => {
  if (!url) return fallback;
  
  // Handle relative paths
  if (url.startsWith('/')) {
    try {
      // Try to construct full URL if running in browser
      if (typeof window !== 'undefined') {
        return new URL(url, window.location.origin).toString();
      }
      // Fallback for SSR
      return url;
    } catch (e) {
      return fallback;
    }
  }
  
  // Handle data URLs
  if (url.startsWith('data:image')) {
    return url;
  }
  
  // Handle absolute URLs
  try {
    new URL(url);
    return url;
  } catch (e) {
    return fallback;
  }
};

/**
 * Component props for images that need safe URL handling
 */
export interface SafeImageProps {
  src: string | StaticImageData;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  onError?: () => void;
}

/**
 * Get props for Next.js Image component with safe defaults
 */
export const getImageProps = ({
  src,
  alt,
  className = '',
  width,
  height,
  fill = false,
  priority = false,
  onError,
}: SafeImageProps) => {
  const isStaticImage = typeof src !== 'string';
  const imageUrl = typeof src === 'string' ? getSafeImageUrl(src) : src;

  return {
    src: imageUrl,
    alt,
    className: `object-cover ${className}`,
    ...(fill ? { fill: true } : { width, height }),
    ...(priority ? { priority: true } : {}),
    onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (onError) {
        onError();
      } else if (typeof src === 'string' && !isStaticImage) {
        // Only update the source if it's not already the fallback
        if (e.currentTarget.src !== getSafeImageUrl('')) {
          e.currentTarget.src = getSafeImageUrl('');
          e.currentTarget.onerror = null; // Prevent infinite loop
        }
      }
    },
  };
};
