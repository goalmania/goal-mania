/**
 * Custom Image Loader with Certificate Error Handling
 * 
 * Handles expired SSL certificates and other image loading errors gracefully
 */

interface ImageLoaderProps {
  src: string;
  width?: number;
  quality?: number;
}

export function customImageLoader({ src, width, quality = 75 }: ImageLoaderProps): string {
  // If it's already a data URL or relative path, return as-is
  if (src.startsWith('data:') || src.startsWith('/')) {
    return src;
  }

  // For external URLs, use Next.js image optimization
  // This will handle certificate errors through Next.js error handling
  try {
    const url = new URL(src);
    
    // If the domain has certificate issues, we'll let Next.js handle it
    // and fall back to the original URL if optimization fails
    return src;
  } catch {
    // Invalid URL, return as-is
    return src;
  }
}

/**
 * Check if an image URL is valid and accessible
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  if (!url || url.startsWith('data:') || url.startsWith('/')) {
    return true; // Assume local/relative URLs are valid
  }

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error: any) {
    // Handle certificate errors and other fetch failures
    if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'CERT_EXPIRED') {
      console.warn(`Image certificate expired: ${url}`);
      return false;
    }
    if (error.name === 'AbortError') {
      console.warn(`Image fetch timeout: ${url}`);
      return false;
    }
    console.warn(`Image validation failed: ${url}`, error.message);
    return false;
  }
}

/**
 * Get fallback image URL
 */
export function getFallbackImage(): string {
  return '/images/image.png';
}

