"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  expiresAt: string;
  isActive: boolean;
  maxUses: number | null;
  currentUses: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCouponsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountPercentage: 10,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // 30 days from now
    maxUses: null as number | null,
    description: "",
  });

  // Fetch coupons when component mounts
  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        toast.error("You don't have permission to access this page");
        router.push("/");
        return;
      }
      fetchCoupons();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/coupons");
    }
  }, [session, status, router]);

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/coupons");

      if (!response.ok) {
        throw new Error("Failed to fetch coupons");
      }

      const data = await response.json();
      setCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewCoupon((prev) => ({
      ...prev,
      [name]:
        name === "discountPercentage"
          ? Number(value)
          : name === "maxUses"
          ? value === ""
            ? null
            : Number(value)
          : value,
    }));
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsCreating(true);
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCoupon),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create coupon");
      }

      toast.success("Coupon created successfully");
      setNewCoupon({
        code: "",
        discountPercentage: 10,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        maxUses: null,
        description: "",
      });
      setIsCreating(false);
      fetchCoupons();
    } catch (error) {
      console.error("Error creating coupon:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create coupon"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleCouponStatus = async (
    id: string,
    currentStatus: boolean
  ) => {
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update coupon");
      }

      toast.success(
        `Coupon ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
      fetchCoupons();
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error("Failed to update coupon");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete coupon");
      }

      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Failed to delete coupon");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Coupon Management</h1>

      {/* Create Coupon Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl text-black font-semibold mb-4">
          Create New Coupon
        </h2>
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-black"
              >
                Coupon Code
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={newCoupon.code}
                onChange={handleInputChange}
                required
                placeholder="SUMMER20"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black h-10"
              />
            </div>

            <div>
              <label
                htmlFor="discountPercentage"
                className="block text-sm font-medium text-black"
              >
                Discount Percentage
              </label>
              <input
                type="number"
                id="discountPercentage"
                name="discountPercentage"
                value={newCoupon.discountPercentage}
                onChange={handleInputChange}
                required
                min="1"
                max="100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black h-10"
              />
            </div>

            <div>
              <label
                htmlFor="expiresAt"
                className="block text-sm font-medium text-black"
              >
                Expiry Date
              </label>
              <input
                type="date"
                id="expiresAt"
                name="expiresAt"
                value={newCoupon.expiresAt}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black h-10"
              />
            </div>

            <div>
              <label
                htmlFor="maxUses"
                className="block text-sm font-medium text-black"
              >
                Maximum Uses (leave empty for unlimited)
              </label>
              <input
                type="number"
                id="maxUses"
                name="maxUses"
                value={newCoupon.maxUses === null ? "" : newCoupon.maxUses}
                onChange={handleInputChange}
                min="1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black h-10"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-black"
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={newCoupon.description}
                onChange={handleInputChange}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black h-20"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl text-black font-semibold p-6">
          Existing Coupons
        </h2>

        {coupons.length === 0 ? (
          <p className="p-6 text-gray-500">No coupons found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                  >
                    Code
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                  >
                    Discount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                  >
                    Expires
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                  >
                    Usage
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-black">
                        {coupon.code}
                      </div>
                      {coupon.description && (
                        <div className="text-sm text-black">
                          {coupon.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">
                      {coupon.discountPercentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">
                      {new Date(coupon.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">
                      {coupon.currentUses} / {coupon.maxUses || "∞"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          coupon.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() =>
                          handleToggleCouponStatus(coupon._id, coupon.isActive)
                        }
                        className={`${
                          coupon.isActive
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                      >
                        {coupon.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="text-red-600 hover:text-red-900 ml-2"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
