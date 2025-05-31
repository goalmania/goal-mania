"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const errorParam = searchParams?.get("error");
    const errorMessages: Record<string, string> = {
      Configuration: "There is a problem with the server configuration.",
      AccessDenied: "You do not have permission to sign in.",
      Verification: "The verification link was invalid or has expired.",
      Default: "An error occurred during authentication.",
    };

    setError(
      errorMessages[errorParam || ""] || errorParam || errorMessages.Default
    );
  }, [searchParams]);

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center">
      <div className="mx-auto flex w-full max-w-md flex-col space-y-6 px-4">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold">Authentication Error</h1>
          <p className="text-zinc-500 dark:text-zinc-400">{error}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href="/auth/signin"
            className={buttonVariants({ variant: "default" })}
          >
            Try Again
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[80vh] flex-col items-center justify-center">
          <div className="mx-auto flex w-full max-w-md flex-col space-y-6 px-4">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-3xl font-bold">Loading...</h1>
            </div>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
