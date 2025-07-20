"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeftIcon, PhotoIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { IArticle } from "@/lib/models/Article";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import DraggableImageGallery, { ArticleImage } from "@/components/admin/DraggableImageGallery";

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



export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const isNewArticle = articleId === "new";

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    image: "", // Keep for backward compatibility
    images: [] as ArticleImage[], // New multiple images array
    category: "news",
    league: "",
    author: "",
    status: "draft",
    featured: false,
    featuredJerseyId: "",
  });
  const [originalFormData, setOriginalFormData] = useState({
    title: "",
    summary: "",
    content: "",
    image: "",
    images: [] as ArticleImage[],
    category: "news",
    league: "",
    author: "",
    status: "draft",
    featured: false,
    featuredJerseyId: "",
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!isNewArticle);
  const [jerseys, setJerseys] = useState<Array<{ id: string; title: string }>>([]);

  // Fetch article data if editing
  useEffect(() => {
    if (!isNewArticle) {
      fetchArticle();
    }
    fetchJerseys();
  }, [articleId, isNewArticle]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = 
      formData.title !== originalFormData.title ||
      formData.summary !== originalFormData.summary ||
      formData.content !== originalFormData.content ||
      formData.category !== originalFormData.category ||
      formData.league !== originalFormData.league ||
      formData.author !== originalFormData.author ||
      formData.status !== originalFormData.status ||
      formData.featured !== originalFormData.featured ||
      formData.featuredJerseyId !== originalFormData.featuredJerseyId ||
      JSON.stringify(formData.images) !== JSON.stringify(originalFormData.images);
    
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalFormData]);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch article");
      }
      const article = await response.json();
      
      // Convert legacy single image to new format if needed
      let images: ArticleImage[] = [];
      if (article.images && Array.isArray(article.images)) {
        images = article.images;
      } else if (article.image) {
        // Convert single image to new format
        images = [{
          id: `legacy-${Date.now()}`,
          url: article.image,
          isMain: true
        }];
      }
      
      const articleData = {
        title: article.title,
        summary: article.summary || "",
        content: article.content,
        image: article.image, // Keep for backward compatibility
        images: images,
        category: article.category,
        league: article.league || "",
        author: article.author,
        status: article.status,
        featured: article.featured || false,
        featuredJerseyId: article.featuredJerseyId || "",
      };
      
      setFormData(articleData);
      setOriginalFormData(articleData); // Set original data for comparison
    } catch (error) {
      console.error("Error fetching article:", error);
      toast.error("Failed to load article");
      router.push("/admin/articles");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJerseys = async () => {
    try {
      const response = await fetch("/api/products?category=all&limit=200");
      if (!response.ok) {
        throw new Error("Failed to fetch jerseys");
      }

      const data = await response.json();
      const products = data.products || [];

      const mappedJerseys = products.map((product: any) => ({
        id: product._id,
        title: product.title,
      }));

      setJerseys(mappedJerseys);
    } catch (error) {
      console.error("Error fetching jerseys:", error);
    }
  };

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

    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
          throw new Error(`Invalid file type: ${file.name}`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File too large: ${file.name}`);
        }

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
          throw new Error(`Upload failed for ${file.name}: ${response.status}`);
        }

        const result = await response.json();
        return {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: result.secure_url,
          alt: file.name,
          isMain: false // Will be set to true if it's the first image
        };
      });

      const newImages = await Promise.all(uploadPromises);
      
      setFormData((prev) => {
        const allImages = [...prev.images, ...newImages];
        
        // Set the first image as main if no main image exists
        if (allImages.length > 0 && !allImages.some(img => img.isMain)) {
          allImages[0].isMain = true;
        }
        
        return {
          ...prev,
          images: allImages,
          // Set main image for backward compatibility
          image: allImages.find(img => img.isMain)?.url || prev.image
        };
      });

      toast.success(`${newImages.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = useCallback((imageId: string) => {
    setFormData((prev) => {
      const newImages = prev.images.filter(img => img.id !== imageId);
      const removedImage = prev.images.find(img => img.id === imageId);
      
      // Update main image if the removed image was main
      let updatedImage = prev.image;
      if (removedImage?.isMain && newImages.length > 0) {
        const newMainImage = newImages[0];
        newImages[0] = { ...newMainImage, isMain: true };
        updatedImage = newMainImage.url;
      } else if (newImages.length === 0) {
        updatedImage = "";
      }
      
      return {
        ...prev,
        images: newImages,
        image: updatedImage
      };
    });
  }, []);

  const handleSetMainImage = useCallback((imageId: string) => {
    setFormData((prev) => {
      const newImages = prev.images.map(img => ({
        ...img,
        isMain: img.id === imageId
      }));
      
      const mainImage = newImages.find(img => img.isMain);
      
      return {
        ...prev,
        images: newImages,
        image: mainImage?.url || ""
      };
    });
  }, []);

  const handleReorderImages = useCallback((newImages: ArticleImage[]) => {
    setFormData((prev) => ({
      ...prev,
      images: newImages
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const articleData = {
        ...formData,
        featured: Boolean(formData.featured),
        featuredJerseyId: formData.featuredJerseyId === "none" ? "" : formData.featuredJerseyId,
        // Ensure we have a main image for backward compatibility
        image: formData.images.find(img => img.isMain)?.url || formData.image || "",
        images: formData.images
      };

      // For internationalTeams category, league is required
      if (articleData.category === "internationalTeams" && !articleData.league) {
        toast.error("League is required for International Teams articles");
        return;
      }

      let response;
      if (isNewArticle) {
        // Create new article
        response = await fetch("/api/articles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(articleData),
        });
      } else {
        // Update existing article
        response = await fetch(`/api/articles/${articleId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(articleData),
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to ${isNewArticle ? 'create' : 'update'} article`);
      }

      toast.success(`Article ${isNewArticle ? 'created' : 'updated'} successfully`);
      
      // Update original form data to reflect saved state
      setOriginalFormData(articleData);
      setHasUnsavedChanges(false);
      
      router.push("/admin/articles");
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error(`Failed to ${isNewArticle ? 'create' : 'update'} article`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex justify-between w-full items-start space-x-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0e1924] tracking-tight">
              {isNewArticle ? "Create New Article" : "Edit Article"}
            </h1>
            <p className="mt-1 text-base text-gray-700">
              {isNewArticle ? "Add a new article to your content library" : "Update article content and settings"}
            </p>
            {hasUnsavedChanges && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-orange-600 font-medium">
                  You have unsaved changes
                </span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              if (hasUnsavedChanges) {
                if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
                  router.push("/admin/articles");
                }
              } else {
                router.push("/admin/articles");
              }
            }}
            className="flex items-center space-x-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Back to Articles</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title" className="block text-sm font-medium text-black">
                    Title *
                  </Label>
                  <Input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="Enter article title"
                  />
                </div>

                <div>
                  <Label htmlFor="summary" className="block text-sm font-medium text-black">
                    Summary *
                  </Label>
                  <Textarea
                    id="summary"
                    name="summary"
                    rows={3}
                    value={formData.summary}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="Brief summary of the article"
                  />
                </div>

                <div>
                  <Label htmlFor="author" className="block text-sm font-medium text-black">
                    Author *
                  </Label>
                  <Input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="Article author name"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Rich Text Content */}
            <Card>
              <CardHeader>
                <CardTitle>Article Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Tip:</strong> Formatting changes (bold, italic, etc.) are applied immediately but not saved until you click "Update Article" below.
                  </p>
                </div>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Article Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image" className="block text-sm font-medium text-black">
                    Main Image URL
                  </Label>
                  <Input
                    type="text"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="Main image URL (auto-filled from uploads)"
                  />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 relative">
                  <input
                    id="image-upload"
                    name="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
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
                    PNG, JPG or WebP up to 5MB (multiple files supported)
                  </div>

                  {isUploading && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        <p className="mt-2 text-sm font-medium text-indigo-700">
                          Uploading images...
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Gallery */}
                <div className="mt-4">
                  <Label className="block text-sm font-medium text-black mb-2">
                    Image Gallery ({formData.images.length} images)
                  </Label>
                  <div className="text-xs text-gray-500 mb-3">
                    Drag to reorder • First image is the main image • Hover to see actions
                  </div>
                  <DraggableImageGallery
                    images={formData.images}
                    onReorder={handleReorderImages}
                    onRemove={handleRemoveImage}
                    onSetMain={handleSetMainImage}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Article Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category" className="block text-sm font-medium text-black">
                    Category *
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
                      League *
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

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, featured: checked as boolean }))
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="featured" className="text-sm text-black">
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
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="w-full"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : isNewArticle
                      ? "Create Article"
                      : hasUnsavedChanges 
                        ? "Update Article (Unsaved Changes)"
                        : "Update Article"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/articles")}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
} 