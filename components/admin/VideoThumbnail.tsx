"use client";

import { useState } from "react";
import { PlayIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoThumbnailProps {
  videoUrl: string;
  onRemove: () => void;
  index: number;
  className?: string;
}

export function VideoThumbnail({ 
  videoUrl, 
  onRemove, 
  index, 
  className = "" 
}: VideoThumbnailProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Playing video:", videoUrl);
    setIsDialogOpen(true);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Removing video:", videoUrl);
    onRemove();
  };

  const handleVideoLoad = () => {
    console.log("Video loaded successfully:", videoUrl);
    setIsLoading(false);
    setThumbnailError(false);
  };

  const handleVideoError = (e: any) => {
    console.error("Video failed to load:", videoUrl, e);
    setIsLoading(false);
    setThumbnailError(true);
  };

  return (
    <>
      <div className={`relative aspect-video overflow-hidden rounded-lg border border-gray-200 group cursor-pointer hover:border-[#f5963c] transition-colors ${className}`}>
        {/* Video thumbnail - we'll use the video element with poster */}
        <div className="relative w-full h-full bg-gray-100">
          {/* Loading state */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f5963c]"></div>
            </div>
          )}
          
          <video
            src={videoUrl}
            className="w-full h-full object-cover"
            preload="metadata"
            muted
            crossOrigin="anonymous"
            onLoadedMetadata={handleVideoLoad}
            onError={handleVideoError}
            onCanPlay={handleVideoLoad}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
          
          {/* Overlay with play button */}
          <div 
            className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={handlePlay}
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors">
              <PlayIcon className="h-6 w-6 text-[#f5963c]" />
            </div>
          </div>

          {/* Play icon overlay (always visible) */}
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs">
            <PlayIcon className="h-3 w-3" />
            <span>Video {index + 1}</span>
          </div>

          {/* Remove button */}
          <Button
            type="button"
            onClick={handleRemove}
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
          >
            <XMarkIcon className="h-3 w-3" />
          </Button>

          {/* Error state */}
          {thumbnailError && (
            <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-red-500 mb-2">
                  <PlayIcon className="h-8 w-8 mx-auto" />
                </div>
                <p className="text-xs text-red-600">Failed to load video</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Video Preview</DialogTitle>
          </DialogHeader>
          <div className="relative w-full">
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-auto max-h-[70vh] rounded-lg"
              preload="metadata"
              crossOrigin="anonymous"
              onError={(e) => console.error("Dialog video error:", e)}
              onCanPlay={() => console.log("Dialog video can play")}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default VideoThumbnail; 