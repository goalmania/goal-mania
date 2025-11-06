# Video Management Feature

## Overview
Added complete admin panel functionality to manage videos displayed in the homepage video section.

## Features Implemented

### 1. Video Model (`lib/models/Video.ts`)
- MongoDB schema for storing videos
- Fields:
  - `title`: Video title
  - `videoUrl`: Direct video URL (MP4 recommended)
  - `thumbnail`: Thumbnail image URL
  - `category`: Video category (default: 'general')
  - `order`: Display order (for sorting)
  - `isActive`: Toggle visibility
  - `createdAt`, `updatedAt`: Timestamps

### 2. API Routes

#### `/api/videos` (GET, POST, PUT)
- **GET**: Fetch all videos or active only (`?activeOnly=true`)
- **POST**: Create new video (admin only)
- **PUT**: Bulk update video order (for drag & drop reordering)

#### `/api/videos/[id]` (GET, PUT, DELETE)
- **GET**: Fetch single video
- **PUT**: Update video (admin only)
- **DELETE**: Delete video (admin only)

### 3. Admin Panel (`/admin/videos`)

Features:
- ✅ View all videos in a table
- ✅ Drag & drop to reorder videos
- ✅ Add new videos (with form validation)
- ✅ Edit existing videos
- ✅ Delete videos (with confirmation)
- ✅ Toggle active/inactive status
- ✅ Preview thumbnail with play icon
- ✅ Video URL validation

Components Used:
- Card, Table, Dialog from shadcn/ui
- DnD Kit for drag & drop functionality
- Toast notifications for user feedback
- Loading skeletons for better UX

### 4. Frontend Integration (`components/home/VideoComp.tsx`)

Updated to:
- Fetch videos from admin panel API
- Display priority: Admin videos → Product videos → Demo videos
- Show up to 4 videos on homepage
- Automatic fallback to demo videos if no admin/product videos
- Loading state while fetching

### 5. Navigation Menu
Added "Videos" menu item in admin sidebar:
- Icon: Camera (IconCamera from Tabler Icons)
- Route: `/admin/videos`
- Position: Between Teams and Coupons

## How to Use

### Access Admin Panel
1. Login as admin
2. Navigate to `/admin/videos`
3. Click "Add Video" button

### Add a Video
1. Click "Add Video"
2. Fill in:
   - **Title**: Video title (e.g., "Giovani talenti in evidenza")
   - **Video**: Either:
     - **Upload Video File**: Choose MP4, MPEG, MOV, or WEBM (Max 100MB)
     - **OR** Enter direct video URL
   - **Thumbnail**: Either:
     - **Upload Image File**: Choose JPG, PNG, or WEBP (Max 10MB)
     - **OR** Enter thumbnail image URL
   - **Category**: Optional category (default: "general")
   - **Active**: Toggle to show/hide on homepage
3. Click "Add Video"

### File Uploads to Cloudinary
- Videos are uploaded to: `goal-mania/videos/` folder
- Thumbnails are uploaded to: `goal-mania/video-thumbnails/` folder
- All files are automatically optimized
- Secure URLs are generated automatically

### Manage Videos
- **Reorder**: Drag and drop videos to change display order
- **Edit**: Click pencil icon to modify video details
- **Delete**: Click trash icon to remove video
- **Toggle**: Use switch to activate/deactivate video

### Video Display Logic
- Homepage shows **up to 4 active videos**
- Videos are sorted by `order` field (ascending)
- If no admin videos: Falls back to product videos
- If no product videos: Shows demo videos

## Technical Details

### Authentication
- All POST/PUT/DELETE operations require authentication
- Uses NextAuth session checking
- Redirects to sign-in if unauthorized

### Database
- MongoDB with Mongoose ORM
- Indexed on `order` and `isActive` for performance
- Timestamps automatically managed

### Type Safety
- Full TypeScript support
- Next.js 15 async params handling
- Proper interface definitions

### File Upload Features
- **Cloudinary Integration**: All uploads stored securely in Cloudinary
- **File Validation**: 
  - Video: MP4, MPEG, MOV, AVI, WEBM (Max 100MB)
  - Images: JPG, PNG, WEBP, GIF (Max 10MB)
- **Automatic Optimization**: Images resized and optimized automatically
- **Preview**: See video and thumbnail previews before uploading
- **Progress Indicators**: Loading states during upload
- **Error Handling**: Detailed error messages for failed uploads

## Files Created/Modified

### Created:
- `lib/models/Video.ts` - MongoDB video schema
- `app/api/videos/route.ts` - CRUD operations for videos
- `app/api/videos/[id]/route.ts` - Single video operations
- `app/api/upload-video/route.ts` - **NEW** Cloudinary upload endpoint
- `app/(admin)/admin/videos/page.tsx` - Admin management interface

### Modified:
- `components/app-sidebar.tsx` - Added Videos menu item
- `components/home/VideoComp.tsx` - Integrated API fetch with priority system

## API Endpoints

### `/api/upload-video` (POST, DELETE)
- **POST**: Upload video or image files to Cloudinary
  - Accepts: FormData with `file` and `type` ('video' or 'image')
  - Returns: Secure Cloudinary URL, public ID, dimensions
  - Validates file type and size
  - Automatically creates folders in Cloudinary
  - Optimizes images (1920x1080 max, auto quality)
- **DELETE**: Remove files from Cloudinary
  - Accepts: `publicId` and `resourceType` query params
  - Returns: Success confirmation

### `/api/videos` (GET, POST, PUT)
- **GET**: Fetch videos (with `?activeOnly=true` filter)
- **POST**: Create video with uploaded files
- **PUT**: Bulk update video order

### `/api/videos/[id]` (GET, PUT, DELETE)
- **GET**: Fetch single video
- **PUT**: Update video
- **DELETE**: Delete video

## Build Status
✅ Build successful - all routes compile without errors
✅ File uploads working - Cloudinary integration complete
✅ Preview functionality - See uploads before saving
✅ Form validation - Proper error handling
