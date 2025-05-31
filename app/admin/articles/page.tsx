"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { IArticle } from "@/lib/models/Article";
import dynamic from "next/dynamic";

// Commented out to avoid TypeScript errors since it's not currently used
/*
// Import the Editor component dynamically to avoid SSR issues
const RichTextEditor = dynamic(
  () =>
    import("@/components/ui/rich-text-editor").catch(() => {
      // If the module is not found, return a simple textarea component
      console.warn("Rich text editor not found, using fallback textarea");
      return ({
        value,
        onChange,
      }: {
        value: string;
        onChange: (value: string) => void;
      }) => (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[200px] p-2 border rounded"
        />
      );
    }),
  {
    ssr: false,
  }
);
*/

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

export default function ArticlesPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<IArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<IArticle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
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

  const resetForm = () => {
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
      featuredJerseyId: "",
    });
  };

  const fetchArticles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let url = "/api/articles?";
      if (categoryFilter) url += `category=${categoryFilter}&`;
      if (statusFilter) url += `status=${statusFilter}&`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch articles");
      }

      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      setError("Failed to load articles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [categoryFilter, statusFilter]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const articleData = {
        ...formData,
        featured: Boolean(formData.featured),
      };

      // For internationalTeams category, league is required
      if (
        articleData.category === "internationalTeams" &&
        !articleData.league
      ) {
        toast.error("League is required for International Teams articles");
        return;
      }

      if (selectedArticle) {
        // Update existing article
        const response = await fetch(`/api/articles/${selectedArticle._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(articleData),
        });

        if (!response.ok) {
          throw new Error("Failed to update article");
        }

        toast.success("Article updated successfully");
      } else {
        // Create new article
        const response = await fetch("/api/articles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(articleData),
        });

        if (!response.ok) {
          throw new Error("Failed to create article");
        }

        toast.success("Article created successfully");
      }

      // Reset form and close modal
      resetForm();
      setIsModalOpen(false);
      setSelectedArticle(null);

      // Refresh articles
      fetchArticles();
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Failed to save article");
    }
  };

  const handleEdit = (article: IArticle) => {
    setSelectedArticle(article);
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
      featuredJerseyId: article.featuredJerseyId || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (articleId: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete article");
      }

      toast.success("Article deleted successfully");
      fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Failed to delete article");
    }
  };

  const handlePreview = (article: IArticle) => {
    // Determine the correct path based on article category
    let basePath = "";
    switch (article.category) {
      case "news":
        basePath = "/news";
        break;
      case "transferMarket":
        basePath = "/transfer";
        break;
      case "serieA":
        basePath = "/serieA";
        break;
      case "internationalTeams":
        basePath = "/international";
        break;
      default:
        basePath = "/news";
    }

    // Navigate to the article page
    router.push(`${basePath}/${article.slug}`);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    console.log(
      "File selected:",
      file.name,
      "Type:",
      file.type,
      "Size:",
      file.size
    );

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
    console.log("Starting upload process");

    // Use the direct fetch API approach that works for products
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      console.log("Uploading to Cloudinary...");
      console.log("Using URL:", process.env.NEXT_PUBLIC_CLOUDINARY_URL);

      const response = await fetch(process.env.NEXT_PUBLIC_CLOUDINARY_URL!, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("Upload successful, received URL:", result.secure_url);

      // Update form with the new image URL
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
        const placeholderUrl =
          "https://res.cloudinary.com/df1j3l9z2/image/upload/v1682615239/sample.jpg";
        setFormData((prev) => ({
          ...prev,
          image: placeholderUrl,
        }));
        toast.success("Using placeholder image");
      } else {
        toast.error(
          "Upload canceled. Please try again or enter an image URL directly."
        );
      }
    } finally {
      setIsUploading(false);
      console.log("Upload process complete");
    }
  };

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add state for available jerseys
  const [jerseys, setJerseys] = useState<Array<{ id: string; title: string }>>(
    []
  );

  // Fetch jerseys for the dropdown
  const fetchJerseys = async () => {
    try {
      // Fetch all products with a high limit to ensure we get them all
      const response = await fetch("/api/products?category=all&limit=200");
      if (!response.ok) {
        throw new Error("Failed to fetch jerseys");
      }

      const data = await response.json();
      const products = data.products || [];

      // Map products to the format needed for the dropdown
      const mappedJerseys = products.map((product: any) => ({
        id: product._id,
        title: product.title,
      }));

      setJerseys(mappedJerseys);
    } catch (error) {
      console.error("Error fetching jerseys:", error);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchJerseys();
  }, [categoryFilter, statusFilter]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black">
            Articles Management
          </h1>
          <p className="mt-2 text-sm text-black">
            Create and manage news articles for different sections of the
            website.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setSelectedArticle(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Article
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 text-black shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-black ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 bg-white"
          >
            <option value="">All Categories</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-black ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 bg-white"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <button
            onClick={fetchArticles}
            className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-semibold text-black hover:bg-gray-200"
          >
            <ArrowPathIcon className="h-5 w-5 mr-1" />
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <ArrowPathIcon className="h-10 w-10 mx-auto text-gray-400 animate-spin" />
          <p className="mt-2 text-gray-500">Loading articles...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchArticles}
            className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Try Again
          </button>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-10 bg-white shadow-sm rounded-xl">
          <p className="text-gray-500">No articles found.</p>
          <button
            onClick={() => {
              resetForm();
              setSelectedArticle(null);
              setIsModalOpen(true);
            }}
            className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Create Your First Article
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-black sm:pl-6"
                >
                  Article
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-black"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-black"
                >
                  Author
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-black"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-black"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-black"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredArticles.map((article: IArticle) => (
                <tr key={article._id?.toString() || `article-${article.slug}`}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                    <div className="flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <Image
                          src={article.image}
                          alt={article.title}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 max-w-md">
                        <div className="font-medium text-black">
                          {article.title}
                        </div>
                        <div className="mt-1 text-black line-clamp-1">
                          {article.summary}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-black">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                      {article.category === "news" && "Main News"}
                      {article.category === "transferMarket" &&
                        "Transfer Market"}
                      {article.category === "serieA" && "Serie A"}
                      {article.category === "internationalTeams" && (
                        <>International - {article.league || "Unknown"}</>
                      )}
                    </span>
                    {article.featured && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-black">
                    {article.author}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        article.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {article.status.charAt(0).toUpperCase() +
                        article.status.slice(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-black">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString()
                      : "Not published"}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handlePreview(article)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Preview"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(article)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(article._id?.toString() || "")
                        }
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-black">
                  {selectedArticle ? "Edit Article" : "Create New Article"}
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="col-span-2">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-black"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-9 text-black"
                    />
                  </div>

                  <div className="col-span-2">
                    <label
                      htmlFor="summary"
                      className="block text-sm font-medium text-black"
                    >
                      Summary
                    </label>
                    <textarea
                      id="summary"
                      name="summary"
                      rows={2}
                      value={formData.summary}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="image"
                      className="block text-sm font-medium text-black"
                    >
                      Image
                    </label>
                    <div className="mt-1 flex flex-col space-y-2">
                      <div className="flex items-center space-x-2 w-full">
                        <input
                          type="text"
                          id="image"
                          name="image"
                          value={formData.image}
                          onChange={handleInputChange}
                          required
                          placeholder="Image URL will appear here after upload"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-9 text-black"
                        />
                      </div>

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
                              <ArrowPathIcon className="h-8 w-8 text-indigo-500 animate-spin" />
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
                    <label
                      htmlFor="author"
                      className="block text-sm font-medium text-black"
                    >
                      Author
                    </label>
                    <input
                      type="text"
                      id="author"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-9 text-black"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-black"
                    >
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-9 text-black bg-white"
                    >
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.category === "internationalTeams" && (
                    <div>
                      <label
                        htmlFor="league"
                        className="block text-sm font-medium text-black"
                      >
                        League
                      </label>
                      <select
                        id="league"
                        name="league"
                        value={formData.league}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-9 text-black bg-white"
                      >
                        <option value="">Select a League</option>
                        {LEAGUES_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-black"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-9 text-black bg-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="featured"
                      name="featured"
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) =>
                        setFormData({ ...formData, featured: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="featured"
                      className="ml-2 block text-sm text-black"
                    >
                      Featured Article
                    </label>
                  </div>

                  {formData.category === "news" && (
                    <div>
                      <label
                        htmlFor="featuredJerseyId"
                        className="block text-sm font-medium text-black"
                      >
                        Featured Jersey in Article
                      </label>
                      <select
                        id="featuredJerseyId"
                        name="featuredJerseyId"
                        value={formData.featuredJerseyId}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-9 text-black bg-white"
                      >
                        <option value="">None (Default)</option>
                        {jerseys.map((jersey) => (
                          <option key={jersey.id} value={jersey.id}>
                            {jersey.title}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Select a jersey to feature in the middle of this article
                      </p>
                    </div>
                  )}

                  <div className="col-span-2">
                    <label
                      htmlFor="content"
                      className="block text-sm font-medium text-black"
                    >
                      Content
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="content"
                        name="content"
                        rows={6}
                        value={formData.content}
                        onChange={handleInputChange}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 border-t border-gray-200 pt-5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-black shadow-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                    disabled={isUploading}
                  >
                    {isUploading
                      ? "Uploading..."
                      : selectedArticle
                      ? "Update Article"
                      : "Create Article"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
