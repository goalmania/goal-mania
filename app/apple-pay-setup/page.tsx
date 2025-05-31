"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ApplePaySetup() {
  const [domain, setDomain] = useState("");
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [host, setHost] = useState("");

  useEffect(() => {
    // Set host from window object only on client-side
    setHost(window.location.host);
  }, []);

  const registerDomain = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch the verification file first
      await fetch("/api/apple-pay-verification");

      // Then register the domain with Stripe
      const response = await fetch("/api/register-apple-pay-domain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: domain || host }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to register domain");
      }

      setRegistered(true);
    } catch (err) {
      console.error("Error registering domain:", err);
      setError(
        err instanceof Error ? err.message : "Failed to register domain"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Apple Pay Domain Registration
            </h1>

            <div className="mb-8 bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-700 mb-2">
                <strong>Current Status:</strong> Apple Pay is not enabled
                because your domain is not registered.
              </p>
              <p className="text-sm text-blue-700">
                Follow the steps below to register your domain with Apple Pay.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Step 1: Set Up Verification File
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  We've automatically created a verification file at:
                </p>
                <code className="bg-gray-100 p-2 block rounded text-sm">
                  /.well-known/apple-developer-merchantid-domain-association
                </code>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Step 2: Register Domain with Stripe
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Register your domain with Stripe to enable Apple Pay:
                </p>

                <div className="mt-4">
                  <label
                    htmlFor="domain"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your domain:
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="domain"
                      id="domain"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder={host}
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-2 text-sm text-red-600">{error}</div>
                )}

                <button
                  type="button"
                  onClick={registerDomain}
                  disabled={loading || registered}
                  className={`mt-4 inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    registered
                      ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                      : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                  } ${
                    loading || registered ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {loading
                    ? "Registering..."
                    : registered
                    ? "Domain Registered ✓"
                    : "Register Domain"}
                </button>
              </div>

              {registered && (
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-sm text-green-700 mb-2">
                    <strong>Success!</strong> Your domain has been registered
                    with Apple Pay.
                  </p>
                  <p className="text-sm text-green-700">
                    You can now use Apple Pay in your checkout.
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/checkout"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Go to checkout →
                    </Link>
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Step 3: Test Apple Pay
                </h2>
                <p className="text-sm text-gray-600 mb-2">
                  After registration, Apple Pay should appear in your checkout.
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Requirements:</strong> Safari browser on macOS or iOS
                  with Apple Pay configured.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
