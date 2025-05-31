"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function AdminCacheControl() {
  const [isRevalidating, setIsRevalidating] = useState(false);

  const handleRevalidate = async () => {
    try {
      setIsRevalidating(true);

      const response = await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error("Failed to revalidate cache");
      }

      const data = await response.json();
      toast.success("Site content refreshed successfully!");
    } catch (error) {
      console.error("Error revalidating cache:", error);
      toast.error("Failed to refresh content");
    } finally {
      setIsRevalidating(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Content Cache Control</h2>
      <p className="text-sm text-gray-600 mb-4">
        If you've made database changes but don't see them reflected on the
        site, use this button to refresh the content cache.
      </p>
      <button
        onClick={handleRevalidate}
        disabled={isRevalidating}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50"
      >
        {isRevalidating ? "Refreshing..." : "Refresh Site Content"}
      </button>
    </div>
  );
}
