"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof ProfileForm, string>>
  >({});
  const [passwordValidationErrors, setPasswordValidationErrors] = useState<
    Partial<Record<keyof PasswordForm, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
      });
    } else if (session === null) {
      // Only redirect if session is definitely null (not undefined/loading)
      router.push("/auth/signin");
    }
  }, [session, router]);

  // Don't try to redirect here - this runs during server-side rendering
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    setIsLoading(true);
    setShowSuccess(false);

    try {
      // Validate form data
      profileSchema.parse(formData);

      // Update profile
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      // Force update the session with new user data
      await updateSession({
        user: {
          ...session.user,
          name: formData.name,
          email: formData.email,
        },
      });

      // Force UI update
      setFormData({
        name: formData.name,
        email: formData.email,
      });

      setIsEditing(false);
      setShowSuccess(true);

      console.log("Profile updated with:", formData);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof ProfileForm, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          errors[path as keyof ProfileForm] = err.message;
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
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordValidationErrors({});
    setIsPasswordLoading(true);
    setShowPasswordSuccess(false);

    try {
      // Validate password data
      passwordSchema.parse(passwordData);

      // Update password
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      // Reset password form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setIsChangingPassword(false);
      setShowPasswordSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowPasswordSuccess(false);
      }, 3000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof PasswordForm, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          errors[path as keyof PasswordForm] = err.message;
        });
        setPasswordValidationErrors(errors);
      } else if (error instanceof Error) {
        setPasswordError(error.message);
      } else {
        setPasswordError("Something went wrong");
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-10 divide-y divide-gray-900/10">
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
            <div className="px-4 sm:px-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900">
                Profile
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                This information will be displayed publicly so be careful what
                you share.
              </p>

              <div className="mt-8">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  Current session data:
                </h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Name: {session.user.name}</p>
                  <p>Email: {session.user.email}</p>
                </div>
              </div>
            </div>

            <Card className="shadow-xl ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="sm:col-span-4 space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      {validationErrors.name && (
                        <p className="mt-2 text-sm text-red-600">
                          {validationErrors.name}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-4 space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      {validationErrors.email && (
                        <p className="mt-2 text-sm text-red-600">
                          {validationErrors.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-8 flex">
                    {!isEditing ? (
                      <Button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        variant="default"
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-3">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          variant="default"
                        >
                          {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              name: session?.user?.name || "",
                              email: session?.user?.email || "",
                            });
                            setValidationErrors({});
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Password Change Section */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 pt-10 md:grid-cols-3">
            <div className="px-4 sm:px-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900">
                Change Password
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Update your password to keep your account secure.
              </p>
            </div>

            <form
              className="bg-white shadow-xl ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2"
              onSubmit={handlePasswordSubmit}
            >
              <div className="px-4 py-6 sm:p-8">
                <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Current Password
                    </label>
                    <div className="mt-2">
                      <input
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        disabled={!isChangingPassword}
                        className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                          isChangingPassword
                            ? "ring-gray-300"
                            : "ring-gray-200 bg-gray-50"
                        } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                      />
                    </div>
                    {passwordValidationErrors.currentPassword && (
                      <p className="mt-2 text-sm text-red-600">
                        {passwordValidationErrors.currentPassword}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-4">
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      New Password
                    </label>
                    <div className="mt-2">
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        disabled={!isChangingPassword}
                        className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                          isChangingPassword
                            ? "ring-gray-300"
                            : "ring-gray-200 bg-gray-50"
                        } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                      />
                    </div>
                    {passwordValidationErrors.newPassword && (
                      <p className="mt-2 text-sm text-red-600">
                        {passwordValidationErrors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-4">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Confirm New Password
                    </label>
                    <div className="mt-2">
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange}
                        disabled={!isChangingPassword}
                        className={`block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ${
                          isChangingPassword
                            ? "ring-gray-300"
                            : "ring-gray-200 bg-gray-50"
                        } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6`}
                      />
                    </div>
                    {passwordValidationErrors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600">
                        {passwordValidationErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8">
                {isChangingPassword ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                      className="text-sm font-semibold leading-6 text-gray-900"
                      disabled={isPasswordLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      disabled={isPasswordLoading}
                    >
                      {isPasswordLoading ? "Updating..." : "Update Password"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(true)}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Change Password
                  </button>
                )}
              </div>

              {showPasswordSuccess && (
                <div className="rounded-md bg-green-50 p-4 m-6">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">
                        Success
                      </h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Password updated successfully</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {passwordError && (
                <div className="rounded-md bg-red-50 p-4 m-6">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Error
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{passwordError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
