"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import { IArticle } from "@/lib/models/Article";

const CATEGORY_OPTIONS = [
  { value: "news", label: "Main News" },
  { value: "transferMarket", label: "Transfer Market" },
  { value: "serieA", label: "Serie A" },
  { value: "internationalTeams", label: "International Teams" },
];

const LEAGUES_OPTIONS = [
  { value: "laliga", label: "La Liga" },
  { value: "premierLeague", label: "Premier League" },
  { value: "bundesliga", label: "Bundesliga" },
  { value: "serieA", label: "Serie A" },
  { value: "ligue1", label: "Ligue 1" },
  { value: "other", label: "Other Leagues" },
];

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article?: IArticle | null;
  onSave: (articleData: any) => Promise<void>;
  jerseys?: Array<{ id: string; title: string }>;
}

export default function ArticleModal({ 
  isOpen, 
  onClose, 
  article, 
  onSave,
  jerseys = []
}: ArticleModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    image: "",
    category: "news",
    league: "",
    author: "",
    status: "draft",
    featured: false,
    featuredJerseyId: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or article changes
  useEffect(() => {
    if (isOpen) {
      if (article) {
        setFormData({
          title: article.title,
          summary: article.summary || "",
          content: article.content,
          image: article.image,
          category: article.category,
          league: article.league || "",
          author: article.author,
          status: article.status,
          featured: article.featured || false,
          featuredJerseyId: article.featuredJerseyId || "none",
        });
      } else {
        setFormData({
          title: "",
          summary: "",
          content: "",
          image: "",
          category: "news",
          league: "",
          author: "",
          status: "draft",
          featured: false,
          featuredJerseyId: "none",
        });
      }
    }
  }, [isOpen, article]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      const response = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_URL!, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      
      setFormData((prev) => ({
        ...prev,
        image: result.secure_url,
      }));

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      
      // Provide option to use placeholder
      const useDirectUrl = window.confirm(
        "Upload failed. Would you like to continue with a placeholder image instead?"
      );

      if (useDirectUrl) {
        const placeholderUrl = "https://res.cloudinary.com/df1j3l9z2/image/upload/v1682615239/sample.jpg";
        setFormData((prev) => ({
          ...prev,
          image: placeholderUrl,
        }));
        toast.success("Using placeholder image");
      } else {
        toast.error("Upload canceled. Please try again or enter an image URL directly.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const articleData = {
        ...formData,
        featured: Boolean(formData.featured),
        featuredJerseyId: formData.featuredJerseyId === "none" ? "" : formData.featuredJerseyId,
      };

      // For internationalTeams category, league is required
      if (articleData.category === "internationalTeams" && !articleData.league) {
        toast.error("League is required for International Teams articles");
        return;
      }

      await onSave(articleData);
      onClose();
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Failed to save article");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-black">
            {article ? "Edit Article" : "Create New Article"}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="col-span-2">
              <Label htmlFor="title" className="block text-sm font-medium text-black">
                Title
              </Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="summary" className="block text-sm font-medium text-black">
                Summary
              </Label>
              <Textarea
                id="summary"
                name="summary"
                rows={2}
                value={formData.summary}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="image" className="block text-sm font-medium text-black">
                Image
              </Label>
              <div className="mt-1 space-y-2">
                <Input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                  placeholder="Image URL will appear here after upload"
                  className="block w-full"
                />

                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 relative">
                  <input
                    id="image-upload"
                    name="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-900
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                    disabled={isUploading}
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    PNG, JPG or WebP up to 5MB
                  </div>

                  {isUploading && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        <p className="mt-2 text-sm font-medium text-indigo-700">
                          Uploading image...
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {formData.image && (
                  <div className="mt-2 h-32 w-32 relative overflow-hidden rounded-md border border-gray-200">
                    <Image
                      src={formData.image}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="author" className="block text-sm font-medium text-black">
                Author
              </Label>
              <Input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category" className="block text-sm font-medium text-black">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.category === "internationalTeams" && (
              <div>
                <Label htmlFor="league" className="block text-sm font-medium text-black">
                  League
                </Label>
                <Select
                  value={formData.league}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, league: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a League" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAGUES_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="status" className="block text-sm font-medium text-black">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center">
              <Checkbox
                id="featured"
                name="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, featured: checked as boolean }))
                }
                className="h-4 w-4"
              />
              <Label htmlFor="featured" className="ml-2 block text-sm text-black">
                Featured Article
              </Label>
            </div>

            {formData.category === "news" && (
              <div>
                <Label htmlFor="featuredJerseyId" className="block text-sm font-medium text-black">
                  Featured Jersey in Article
                </Label>
                <Select
                  value={formData.featuredJerseyId || "none"}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, featuredJerseyId: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="None (Default)" />
                  </SelectTrigger>
                                  <SelectContent>
                  <SelectItem value="none">None (Default)</SelectItem>
                  {jerseys.map((jersey) => (
                    <SelectItem key={jersey.id} value={jersey.id}>
                      {jersey.title}
                    </SelectItem>
                  ))}
                </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-gray-500">
                  Select a jersey to feature in the middle of this article
                </p>
              </div>
            )}

            <div className="col-span-2">
              <Label htmlFor="content" className="block text-sm font-medium text-black">
                Content
              </Label>
              <Textarea
                id="content"
                name="content"
                rows={6}
                value={formData.content}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 border-t border-gray-200 pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting
                ? "Saving..."
                : article
                ? "Update Article"
                : "Create Article"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 