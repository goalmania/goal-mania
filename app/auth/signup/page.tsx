"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),

    phone: z
      .string()
      .min(7, "Phone number must be at least 7 digits")
      .max(15, "Phone number must be at most 15 digits")
      .regex(/^[0-9]+$/, "Phone number must contain only numbers"),

    country: z.string().min(1, "Country is required"),
    pincode: z
      .string()
      .min(4, "Pin Code must be at least 4 characters")
      .max(10, "Pin Code must be at most 10 characters"),

    marketing: z.boolean().optional(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof SignUpForm, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: SignUpForm = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      country: formData.get("country") as string,
      pincode: formData.get("pincode") as string,
      marketing: formData.get("marketing") === "on",
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    try {
      // Validate form data
      signUpSchema.parse(data);

      // Send registration request
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }

      // Sign in the user automatically
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Failed to sign in");
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof SignUpForm, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as keyof SignUpForm] = err.message;
          }
        });
        setValidationErrors(errors);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 p-6 lg:p-10 gap-10 lg:gap-0">
      {/* Image Left */}
      <div className="relative h-[60vh] lg:h-auto rounded-2xl">
        <div className="absolute inset-0">
          <img
            src={`/images/recentUpdate/login-bg.png`}
            alt="Banner Background"
            className="w-full h-full rounded-2xl object-cover"
          />
        </div>
      </div>

      {/* Form Right */}
      <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-start text-[47px] font-medium font-munish tracking-tight text-gray-900">
            Crea account
          </h2>
        </div>

        <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-4   ">
            <form className="space-y-6 font-munish" onSubmit={handleSubmit}>
              {/* Phone Number */}
              <div className="flex items-center gap-2">
                <span className="text-[#333333] font-medium">+39</span>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="bg-white border-0 flex-1 border-b py-2 border-black placeholder:text-[#333333] text-[#333333] font-light rounded-none shadow-none pl-0"
                  placeholder="xxxxxxxxxx"
                />
              </div>
              {validationErrors.phone && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.phone}
                </p>
              )}

              {/* Marketing Checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox className=" bg-[#D9D9D9] rounded-full" />
                <Label
                  htmlFor="marketing"
                  className="text-sm text-gray-600] select-none cursor-pointer"
                >
                  Avvisami su ordini, offerte e aggiornamenti
                </Label>
              </div>

              <Input
                id="name"
                name="name"
                type="text"
                required
                className="bg-white border-0 w-full border-b py-2 border-black placeholder:text-[#333333] text-[#333333] font-light rounded-none shadow-none pl-0"
                placeholder="Full name"
              />
              {validationErrors.name && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.name}
                </p>
              )}

              {/* Country + Pin Code */}
              <div className="flex gap-3">
                <select
                  id="country"
                  name="country"
                  className="bg-white border text-sm rounded-full py-2 font-munish border-black text-[#333333] font-light px-2 shadow-none  focus:ring-0"
                  defaultValue="Italy"
                >
                  <option value="Italy">Italy</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                </select>
                <Input
                  id="pincode"
                  name="pincode"
                  type="text"
                  required
                  className="bg-white border-0 flex-1 border-b py-2 border-black placeholder:text-[#333333] text-[#333333] font-light rounded-none shadow-none pl-0"
                  placeholder="Pin Code"
                />
              </div>
              {validationErrors.pincode && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.pincode}
                </p>
              )}

              {/* Password */}
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-white border-0 w-full border-b py-2 border-black placeholder:text-[#333333] text-[#333333] font-light rounded-none shadow-none pl-0"
                placeholder="Create a password"
              />
              {validationErrors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.password}
                </p>
              )}

              {/* Confirm Password */}
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="bg-white border-0 w-full border-b py-2 border-black placeholder:text-[#333333] text-[#333333] font-light rounded-none shadow-none pl-0"
                placeholder="Confirm your password"
              />
              {validationErrors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {validationErrors.confirmPassword}
                </p>
              )}

              {/* Error message */}
              {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-100">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-1">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-full bg-[#FF7A00] px-3 gap-1.5 py-2 text-sm font-medium items-center text-[#0A1A2F] shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating account..." : "Crea account →"}
                </Button>

                <div className=" text-[#888888] text-[14px] text-center">
                  Leggi l’informativa sulla{" "}
                  <span className=" text-[#3182CE]">privacy </span>e i termini{" "}
                  <span className=" text-[#3182CE]">econdizioni </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="flex w-full justify-center rounded-full px-3 gap-1.5 py-2 text-sm font-medium items-center text-[#0A1A2F] border border-gray-300"
              >
                Spedisci →
              </Button>
            </form>
          </div>

          <p className=" font-munish text-center text-[14px] text-[#888888]">
            Leggi l’informativa sulla privacy e i Termini e Condizioni.
          </p>
        </div>
      </div>
    </div>
  );
}
