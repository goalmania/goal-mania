"use client";

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

/**
 * Video Management Admin Panel
 * 
 * Features:
 * - Upload videos and thumbnails directly to Cloudinary
 * - Drag & drop to reorder videos
 * - Toggle active/inactive status
 * - Preview before uploading
 * 
 * File Upload:
 * - Videos: MP4, MPEG, MOV, WEBM (Max 100MB) → goal-mania/videos/
 * - Thumbnails: JPG, PNG, WEBP (Max 10MB) → goal-mania/video-thumbnails/
 * 
 * Usage:
 * 1. Click "Add Video"
 * 2. Enter title
 * 3. Either upload files OR enter URLs (not both)
 * 4. Files are automatically uploaded to Cloudinary on submit
 * 5. Up to 4 active videos displayed on homepage
 */

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  PlayIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "react-hot-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical } from "@tabler/icons-react";

interface Video {
  _id: string;
  title: string;
  videoUrl: string;
  thumbnail: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Sortable video row component
function SortableVideoRow({ video, onEdit, onDelete, onToggleStatus }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? "bg-muted" : ""}>
      <TableCell>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <IconGripVertical className="h-5 w-5 text-gray-400" />
        </div>
      </TableCell>
      <TableCell>{video.order}</TableCell>
      <TableCell>
        <div className="relative w-20 h-12 rounded overflow-hidden bg-gray-100">
          {video.thumbnail ? (
            <>
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <PlayIcon className="w-6 h-6 text-white" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayIcon className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="font-medium">{video.title}</TableCell>
      <TableCell>
        <a
          href={video.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm truncate block max-w-[200px]"
        >
          {video.videoUrl}
        </a>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{video.category}</Badge>
      </TableCell>
      <TableCell>
        <Switch
          checked={video.isActive}
          onCheckedChange={() => onToggleStatus(video)}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(video)}
            className="hover:bg-blue-50"
          >
            <PencilIcon className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(video._id)}
            className="hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function AdminVideosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    videoUrl: "",
    thumbnail: "",
    category: "general",
    order: 0,
    isActive: true,
  });
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/videos");
    } else if (status === "authenticated") {
      fetchVideos();
    }
  }, [status, router]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/videos");
      const data = await response.json();

      if (data.success) {
        setVideos(data.videos);
      } else {
        toast.error("Failed to fetch videos");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Failed to fetch videos");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = videos.findIndex((v) => v._id === active.id);
    const newIndex = videos.findIndex((v) => v._id === over.id);

    const newVideos = arrayMove(videos, oldIndex, newIndex);
    
    // Update order property
    const updatedVideos = newVideos.map((video, index) => ({
      ...video,
      order: index,
    }));

    setVideos(updatedVideos);

    // Save to backend
    try {
      const response = await fetch("/api/videos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videos: updatedVideos }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error("Failed to update video order");
        fetchVideos(); // Revert on error
      } else {
        toast.success("Video order updated");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update video order");
      fetchVideos(); // Revert on error
    }
  };

  const uploadFile = async (file: File, type: 'video' | 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/upload-video', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let videoUrl = formData.videoUrl;
      let thumbnailUrl = formData.thumbnail;

      // Upload video file if selected
      if (videoFile) {
        setUploadingVideo(true);
        toast.loading("Uploading video...");
        videoUrl = await uploadFile(videoFile, 'video');
        toast.dismiss();
        toast.success("Video uploaded successfully");
      }

      // Upload thumbnail if selected
      if (thumbnailFile) {
        setUploadingThumbnail(true);
        toast.loading("Uploading thumbnail...");
        thumbnailUrl = await uploadFile(thumbnailFile, 'image');
        toast.dismiss();
        toast.success("Thumbnail uploaded successfully");
      }

      // Validate URLs
      if (!videoUrl || !thumbnailUrl) {
        toast.error("Video and thumbnail are required");
        return;
      }

      const url = editingVideo ? `/api/videos/${editingVideo._id}` : "/api/videos";
      const method = editingVideo ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          videoUrl,
          thumbnail: thumbnailUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingVideo ? "Video updated successfully" : "Video created successfully");
        setIsDialogOpen(false);
        resetForm();
        fetchVideos();
      } else {
        toast.error(data.message || "Failed to save video");
      }
    } catch (error: any) {
      console.error("Error saving video:", error);
      toast.error(error.message || "Failed to save video");
    } finally {
      setUploadingVideo(false);
      setUploadingThumbnail(false);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      videoUrl: video.videoUrl,
      thumbnail: video.thumbnail,
      category: video.category,
      order: video.order,
      isActive: video.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      const response = await fetch(`/api/videos/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Video deleted successfully");
        fetchVideos();
      } else {
        toast.error(data.message || "Failed to delete video");
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error("Failed to delete video");
    }
  };

  const handleToggleStatus = async (video: Video) => {
    try {
      const response = await fetch(`/api/videos/${video._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...video, isActive: !video.isActive }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Video ${!video.isActive ? "activated" : "deactivated"}`);
        fetchVideos();
      } else {
        toast.error("Failed to toggle video status");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to toggle video status");
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      // Clear URL input when file is selected
      setFormData({ ...formData, videoUrl: "" });
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      // Clear URL input when file is selected
      setFormData({ ...formData, thumbnail: "" });
    }
  };

  const resetForm = () => {
    setEditingVideo(null);
    setFormData({
      title: "",
      videoUrl: "",
      thumbnail: "",
      category: "general",
      order: 0,
      isActive: true,
    });
    setVideoFile(null);
    setThumbnailFile(null);
    setVideoPreview("");
    setThumbnailPreview("");
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto py-10 space-y-4">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Videos Management</h1>
          <p className="text-muted-foreground">Manage homepage video section</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="bg-[#f5963c] hover:bg-[#e0852e]"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Video
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Videos ({videos.length})</CardTitle>
          <CardDescription>
            Drag and drop to reorder videos. Up to 4 videos will be displayed on the homepage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <Alert>
              <AlertDescription>
                No videos found. Click "Add Video" to create your first video.
              </AlertDescription>
            </Alert>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[80px]">Order</TableHead>
                    <TableHead className="w-[100px]">Preview</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Video URL</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={videos.map((v) => v._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {videos.map((video) => (
                      <SortableVideoRow
                        key={video._id}
                        video={video}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingVideo ? "Edit Video" : "Add New Video"}</DialogTitle>
            <DialogDescription>
              {editingVideo
                ? "Update video information"
                : "Add a new video to the homepage section"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter video title"
                required
              />
            </div>

            {/* Video Upload Section */}
            <div className="space-y-2">
              <Label>Video *</Label>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="videoFile" className="text-sm text-muted-foreground">
                    Upload Video File
                  </Label>
                  <Input
                    id="videoFile"
                    type="file"
                    accept="video/mp4,video/mpeg,video/quicktime,video/webm"
                    onChange={handleVideoFileChange}
                    disabled={uploadingVideo}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    MP4, MPEG, MOV, WEBM (Max 100MB)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="h-px bg-border flex-1" />
                </div>
                <div>
                  <Label htmlFor="videoUrl" className="text-sm text-muted-foreground">
                    Video URL
                  </Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://example.com/video.mp4"
                    disabled={!!videoFile || uploadingVideo}
                    className="mt-1"
                  />
                </div>
              </div>
              {videoPreview && (
                <div className="mt-2">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full max-h-40 rounded border"
                  />
                </div>
              )}
            </div>

            {/* Thumbnail Upload Section */}
            <div className="space-y-2">
              <Label>Thumbnail *</Label>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="thumbnailFile" className="text-sm text-muted-foreground">
                    Upload Thumbnail Image
                  </Label>
                  <Input
                    id="thumbnailFile"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleThumbnailFileChange}
                    disabled={uploadingThumbnail}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, WEBP (Max 10MB)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="h-px bg-border flex-1" />
                </div>
                <div>
                  <Label htmlFor="thumbnail" className="text-sm text-muted-foreground">
                    Thumbnail URL
                  </Label>
                  <Input
                    id="thumbnail"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="https://example.com/thumbnail.jpg"
                    disabled={!!thumbnailFile || uploadingThumbnail}
                    className="mt-1"
                  />
                </div>
              </div>
              {thumbnailPreview && (
                <div className="mt-2">
                  <Image
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    width={200}
                    height={112}
                    className="rounded border object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="general"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                disabled={uploadingVideo || uploadingThumbnail}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#f5963c] hover:bg-[#e0852e]"
                disabled={uploadingVideo || uploadingThumbnail}
              >
                {uploadingVideo || uploadingThumbnail ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  editingVideo ? "Update Video" : "Add Video"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
