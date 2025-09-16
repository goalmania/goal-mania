/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/hooks/useI18n";
import { ArrowRight } from "lucide-react";

function SignInContent() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  // Check for auth-required reason
  const showAuthRequired = searchParams.get("reason") === "auth-required";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        toast.error("Invalid email or password");
      } else {
        toast.success("Signed in successfully!");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("Something went wrong");
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 p-10 gap-10 lg:gap-0 font-munish">
      {/* Image Left */}
      <div className="relative h-[60vh] lg:h-auto rounded-2xl">
        <div className="absolute   inset-0">
          <img
            src={`/images/recentUpdate/login-bg.png`}
            alt="Banner Background"
            className="w-full h-full rounded-2xl  object-cover"
          />
        </div>
      </div>

      <div className="  flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* <div className="sm:mx-auto sm:w-full sm:max-w-md"> */}

          <h2 className=" text-start text-[57px] font-medium tracking-tight text-black">
            {t("auth.signIn")}
          </h2>
          <p className=" text-[#131228] text-[22px] ">
            Inserisci il numero di cellulare (most common)
          </p>
        </div>

        <div className=" sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4  sm:px-10">
            {/* Show alert if redirected for auth-required */}
            {showAuthRequired && (
              <div className="mb-4 rounded-md bg-yellow-50 p-4 border border-yellow-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-8-3a1 1 0 00-1 1v2a1 1 0 002 0V8a1 1 0 00-1-1zm0 6a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      {t("auth.pleaseSignIn")}
                    </h3>
                  </div>
                </div>
              </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="bg-white border-0 w-full py-2 border-b border-black  font-light rounded-none shadow-none pl-0 placeholder:text-[#333333] text-[#333333]"
                    placeholder={t("auth.emailPlaceholder")}
                  />
                </div>
              </div>

              <div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="bg-white border-0 w-full border-b py-2 border-black  placeholder:text-[#333333] text-[#333333] font-light rounded-none shadow-none pl-0"
                    placeholder={t("auth.passwordPlaceholder")}
                  />
                </div>
                <div className="text-sm justify-end flex mt-1.5">
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-[#3182CE] transition-colors"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-100">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
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
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-full bg-[#FF7A00] px-3 gap-1.5 py-2 text-sm font-medium  items-center text-[#0A1A2F] shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t("common.processing") : t("auth.signIn")}
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  {t("auth.orContinueWith")}
                </span>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
                >
                  <Image
                    src="/images/contactImages/google.png"
                    alt="Google"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                  <span>{t("auth.continueWithGoogle")}</span>
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-gray-600">
              {t("auth.notAMember")}{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                {t("auth.signUpNow")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <span className="text-3xl font-bold text-indigo-600">
              Goal Mania
            </span>
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>
      </div>
    );
  }

  return <SignInContent />;
}
