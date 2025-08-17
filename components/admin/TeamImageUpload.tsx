"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image, Link, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface TeamImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function TeamImageUpload({ value, onChange, label = "Team Logo" }: TeamImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(value || "");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0]; // Only take the first file for team logo
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("files", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      const uploadedUrl = result.urls[0];

      onChange(uploadedUrl);
      setUrlInput(uploadedUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.svg']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: isUploading
  });

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    onChange(url);
    setError(null);
  };

  const clearImage = () => {
    onChange("");
    setUrlInput("");
    setError(null);
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Image URL
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload File
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="https://example.com/team-logo.png"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter a direct URL to an image file
            </p>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
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
                    ? "Drop image here..." 
                    : "Drag & drop team logo here, or click to select"
                  }
                </p>
                <p className="text-xs text-gray-500">
                  Supports: JPG, PNG, WebP, GIF, SVG (max 5MB)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

      {/* Image Preview */}
      {value && !isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">Preview</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearImage}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
            <img
              src={value}
              alt="Team logo preview"
              className="w-full h-full object-contain bg-gray-50"
              onError={() => setError("Failed to load image. Please check the URL.")}
            />
          </div>
        </div>
      )}
    </div>
  );
} 