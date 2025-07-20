"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const [editedUser, setEditedUser] = useState<{
    name: string;
    role: string;
  }>({ name: "", role: "user" });

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        toast.error("You don't have permission to access this page");
        router.push("/");
        return;
      }
      fetchUsers();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/users");
    }
  }, [session, status, router, currentPage]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching users...");

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(
        `/api/admin/users?page=${currentPage}&limit=${usersPerPage}&search=${searchTerm}&_t=${timestamp}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API response error:", response.status, errorText);
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      console.log("Users data received:", data);

      if (!data.users || !Array.isArray(data.users)) {
        console.error("Invalid data format:", data);
        throw new Error("Invalid response format");
      }

      setUsers(data.users);
      setPagination({
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 10,
        totalPages: data.totalPages || 1,
        hasNextPage: data.page < data.totalPages,
        hasPreviousPage: data.page > 1,
      });
      setTotalPages(Math.ceil(data.total / usersPerPage));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users. Please try again.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      toast.success("User role updated successfully");

      // Update the user in the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setEditedUser({
      name: user.name,
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (userId: string) => {
    setUserIdToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userIdToDelete) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/users?id=${userIdToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);

      // Only update if there are actual changes
      if (
        editedUser.name === currentUser.name &&
        editedUser.role === currentUser.role
      ) {
        setIsEditModalOpen(false);
        return;
      }

      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: currentUser._id,
          name: editedUser.name,
          role: editedUser.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      toast.success("User updated successfully");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-gray-600">Loading customer data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-black">User Management</h1>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-4"
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email"
            className="input input-bordered flex-grow text-black"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md w-full sm:w-auto flex items-center justify-center"
          >
            <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
            Search
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-6 text-black">Users</h2>

        {users.length === 0 ? (
          <p className="p-6 text-black">No users found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider"
                    >
                      Joined
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
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-black">
                          {user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-black">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-purple-100 text-black"
                              : user.role === "premium"
                              ? "bg-green-100 text-black"
                              : "bg-blue-100 text-black"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user._id, e.target.value)
                          }
                          className="select select-bordered select-sm w-full max-w-xs text-black"
                          disabled={user._id === session?.user?.id} // Can't change own role
                        >
                          <option value="user">User</option>
                          <option value="premium">Premium</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 flex justify-center">
                <div className="join">
                  <button
                    className="join-item btn text-black"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    «
                  </button>
                  <button className="join-item btn text-black">
                    Page {currentPage} of {totalPages}
                  </button>
                  <button
                    className="join-item btn text-black"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit User Modal - now functional */}
      {isEditModalOpen && currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Edit User
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={editedUser.name}
                  onChange={(e) =>
                    setEditedUser((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={currentUser.email}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={editedUser.role}
                  onChange={(e) =>
                    setEditedUser((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="user">User</option>
                  <option value="premium">Premium</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - now functional */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
