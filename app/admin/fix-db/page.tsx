"use client";

import { useState } from "react";

export default function FixDatabasePage() {
  const [productResult, setProductResult] = useState<any>(null);
  const [articleResult, setArticleResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fixProductIndexes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/fix-db-indexes");
      const data = await response.json();
      setProductResult(data);
    } catch (err) {
      setError("Failed to fix product indexes");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fixArticleIndexes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/fix-db-indexes/articles");
      const data = await response.json();
      setArticleResult(data);
    } catch (err) {
      setError("Failed to fix article indexes");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Fix Database Indexes</h1>

      <div className="space-y-8">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Product Collection Indexes
          </h2>
          <p className="mb-4 text-gray-600">
            Click the button below to remove the problematic SKU index from the
            products collection. This will fix the "duplicate key error" when
            creating products.
          </p>
          <button
            onClick={fixProductIndexes}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Fix Product Indexes"}
          </button>

          {productResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded border">
              <h3 className="font-bold">{productResult.message}</h3>
              <pre className="mt-2 text-sm overflow-auto max-h-64 bg-gray-100 p-2 rounded">
                {JSON.stringify(productResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            Article Collection Indexes
          </h2>
          <p className="mb-4 text-gray-600">
            Click the button below to check for and remove any problematic
            indexes from the articles collection.
          </p>
          <button
            onClick={fixArticleIndexes}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Fix Article Indexes"}
          </button>

          {articleResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded border">
              <h3 className="font-bold">{articleResult.message}</h3>
              <pre className="mt-2 text-sm overflow-auto max-h-64 bg-gray-100 p-2 rounded">
                {JSON.stringify(articleResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}
