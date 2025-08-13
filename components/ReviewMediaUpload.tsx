"use client";

import { useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Image, Video, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface MediaFile {
  url: string;
  type: "image" | "video";
  filename: string;
}

interface ReviewMediaUploadProps {
  onMediaChange: (media: { images: string[]; videos: string[] }) => void;
  maxFiles?: number;
}

export interface ReviewMediaUploadRef {
  clear: () => void;
}

const ReviewMediaUpload = forwardRef<ReviewMediaUploadRef, ReviewMediaUploadProps>(({ 
  onMediaChange, 
  maxFiles = 5 
}, ref) => {
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = useCallback(() => {
    setUploadedFiles([]);
    setError(null);
    onMediaChange({ images: [], videos: [] });
  }, [onMediaChange]);

  useImperativeHandle(ref, () => ({
    clear
  }), [clear]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append("files", file);
      });

      const response = await fetch("/api/reviews/upload-media", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      const newFiles = result.files;

      setUploadedFiles(prev => {
        const updated = [...prev, ...newFiles];
        updateParentMedia(updated);
        return updated;
      });

      toast.success(`${newFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }, [uploadedFiles, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
      'video/*': ['.mp4', '.webm', '.ogg']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      updateParentMedia(updated);
      return updated;
    });
  };

  const updateParentMedia = (files: MediaFile[]) => {
    const images = files.filter(f => f.type === "image").map(f => f.url);
    const videos = files.filter(f => f.type === "video").map(f => f.url);
    onMediaChange({ images, videos });
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-4">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? "border-[#f5963c] bg-[#f5963c]/5" 
                : "border-gray-300 hover:border-[#f5963c] hover:bg-gray-50"
              }
              ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-1">
              {isDragActive 
                ? "Drop files here..." 
                : "Drag & drop photos/videos here, or click to select"
              }
            </p>
            <p className="text-xs text-gray-500">
              Supports: JPG, PNG, WebP, GIF, MP4, WebM, OGG (max 10MB each)
            </p>
            <p className="text-xs text-gray-500">
              Maximum {maxFiles} files
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#f5963c]"></div>
          <span className="ml-2 text-sm text-gray-600">Uploading...</span>
        </div>
      )}

      {/* File Previews */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Media ({uploadedFiles.length}/{maxFiles})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <Card className="overflow-hidden">
                  <CardContent className="p-2">
                    {file.type === "image" ? (
                      <div className="relative aspect-square">
                        <img
                          src={file.url}
                          alt={file.filename}
                          className="w-full h-full object-cover rounded"
                        />
                        <div className="absolute top-1 left-1 bg-black/50 rounded p-1">
                          <Image className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
                        <Video className="h-8 w-8 text-gray-400" />
                        <div className="absolute top-1 left-1 bg-black/50 rounded p-1">
                          <Video className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {file.filename}
                    </p>
                  </CardContent>
                </Card>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ReviewMediaUpload.displayName = "ReviewMediaUpload";

export default ReviewMediaUpload; 