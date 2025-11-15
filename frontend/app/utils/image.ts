// Helper function to get the full image URL
// Uses NEXT_PUBLIC_MEDIA_URL from .env for all images except rooms
export function getImageUrl(imagePath: string | undefined | null): string {
  if (!imagePath) return '';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Check if NEXT_PUBLIC_MEDIA_URL is set in environment
  const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL;
  
  if (mediaUrl) {
    // Remove trailing slash from media URL
    const baseUrl = mediaUrl.replace(/\/$/, '');
    
    // Remove leading slash from image path
    const cleanPath = imagePath.replace(/^\/+/, '');
    
    // Construct full URL
    return `${baseUrl}/${cleanPath}`;
  }
  
  // Fallback to original behavior if NEXT_PUBLIC_MEDIA_URL is not set
  // In production, use the rewrite rule for uploads
  if (process.env.NODE_ENV === 'production') {
    // Remove any leading slashes and ensure proper path construction
    const cleanPath = imagePath.replace(/^\/+/, '');
    
    // If the path doesn't start with uploads/, add it
    const finalPath = cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;
    
    // Use the rewrite rule (relative path)
    return `/${finalPath}`;
  }
  
  // In development, use the proxy route
  if (imagePath.startsWith('/uploads/')) {
    // Remove any leading slashes to ensure clean path joining
    const cleanPath = imagePath.replace(/^\/+/, '');
    return `/api/image-proxy?path=${encodeURIComponent(cleanPath)}`;
  }
  
  // For other cases in development, try to construct a proper path
  if (imagePath.startsWith('uploads/')) {
    return `/api/image-proxy?path=${encodeURIComponent(imagePath)}`;
  }
  
  // Return as is for other cases (like data URLs)
  return imagePath;
}

// Default placeholder image
export const PLACEHOLDER_IMAGE = '/images/placeholder-shower.svg';
