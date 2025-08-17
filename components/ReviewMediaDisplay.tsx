"use client";

import { useState } from "react";
import { Image, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ReviewMediaDisplayProps {
  media: {
    images: string[];
    videos: string[];
  };
  className?: string;
}

export default function ReviewMediaDisplay({ media, className = "" }: ReviewMediaDisplayProps) {
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: "image" | "video" } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const allMedia = [
    ...media.images.map(url => ({ url, type: "image" as const })),
    ...media.videos.map(url => ({ url, type: "video" as const }))
  ];

  if (allMedia.length === 0) {
    return null;
  }

  const handleMediaClick = (mediaItem: { url: string; type: "image" | "video" }) => {
    setSelectedMedia(mediaItem);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 ${className}`}>
        {allMedia.slice(0, 4).map((mediaItem, index) => (
          <div
            key={mediaItem.url}
            className="relative group cursor-pointer"
            onClick={() => handleMediaClick(mediaItem)}
          >
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-1">
                {mediaItem.type === "image" ? (
                  <div className="relative aspect-square">
                    <img
                      src={mediaItem.url}
                      alt={`Review media ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                    <div className="absolute top-1 left-1 bg-black/50 rounded p-1">
                      <Image className="h-3 w-3 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
                    <Video className="h-6 w-6 text-gray-400" />
                    <div className="absolute top-1 left-1 bg-black/50 rounded p-1">
                      <Video className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Overlay for hover effect */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded" />
          </div>
        ))}
        
        {/* Show count indicator if there are more than 4 items */}
        {allMedia.length > 4 && (
          <div className="relative">
            <Card className="overflow-hidden">
              <CardContent className="p-1">
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-600">+{allMedia.length - 4}</div>
                    <div className="text-xs text-gray-500">more</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Media Preview Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Review Media</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedMedia && (
            <div className="flex justify-center items-center max-h-[70vh]">
              {selectedMedia.type === "image" ? (
                <img
                  src={selectedMedia.url}
                  alt="Review media"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  controls
                  className="max-w-full max-h-full"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 