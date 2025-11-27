# Certificate Error Fix for Image Loading

## Issue
When loading images from external domains (like `goalmania.shop`) with expired SSL certificates, Next.js Image optimization fails with:
```
[TypeError: fetch failed] {
  [cause]: [Error: certificate has expired] { code: 'CERT_HAS_EXPIRED' }
}
```

## Solutions Implemented

### 1. Safe Image Component
A new `SafeImage` component has been created that automatically falls back to a placeholder image if loading fails.

**Usage:**
```tsx
import { SafeImage } from "@/components/ui/SafeImage";

<SafeImage
  src={product.images[0]}
  alt={product.title}
  fill
  className="object-cover"
/>
```

### 2. Image Proxy API
An image proxy endpoint has been created at `/api/image-proxy` that handles certificate errors server-side.

**Usage:**
```tsx
const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
```

### 3. Development Mode Options

#### Option A: Disable Image Optimization (Quick Fix)
Add to `.env.local`:
```env
DISABLE_IMAGE_OPTIMIZATION=true
```

This will bypass Next.js image optimization in development, loading images directly.

#### Option B: Use Image Proxy
Update image URLs to use the proxy:
```tsx
const getImageUrl = (url: string) => {
  if (url.startsWith('http') && !url.includes('localhost')) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};
```

### 4. Production Solution
For production, the external domain (`goalmania.shop`) should:
1. Renew their SSL certificate
2. Or migrate images to a CDN with valid certificates (like Cloudinary)

## Recommended Approach

1. **Short-term (Development):**
   - Use `SafeImage` component for all external images
   - Or set `DISABLE_IMAGE_OPTIMIZATION=true` in development

2. **Long-term (Production):**
   - Fix SSL certificate on `goalmania.shop`
   - Or migrate images to Cloudinary/CDN
   - Use `SafeImage` component as fallback safety

## Files Created

- `components/ui/SafeImage.tsx` - Safe image component with error handling
- `lib/utils/imageLoader.ts` - Image utility functions
- `app/api/image-proxy/route.ts` - Image proxy API endpoint

## Testing

To test the fix:
1. Try loading an image from `goalmania.shop`
2. Verify it falls back to placeholder if certificate error occurs
3. Check browser console for warnings (not errors)

