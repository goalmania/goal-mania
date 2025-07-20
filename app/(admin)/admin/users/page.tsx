"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUsers } from "@/hooks/useUsers";
import { UserDataTable } from "@/components/admin/UserDataTable";
import { EditUserModal } from "@/components/admin/EditUserModal";
import { DeleteUserModal } from "@/components/admin/DeleteUserModal";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const [userNameToDelete, setUserNameToDelete] = useState("");

  // Use the optimized users hook
  const {
    users,
    pagination,
    isLoading,
    error,
    fetchUsers,
    refreshUsers,
    clearError,
    updateUserRole,
    deleteUser,
    updateUser,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    currentLimit,
    setCurrentLimit,
  } = useUsers({
    initialLimit: 10,
    enableCache: true,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
        router.push("/");
        return;
      }
      fetchUsers();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin/users");
    }
  }, [session, status, router, fetchUsers]);

  const handleEditUser = useCallback((userId: string) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setCurrentUser(user);
      setIsEditModalOpen(true);
    }
  }, [users]);

  const handleDeleteClick = useCallback((userId: string) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setUserIdToDelete(userId);
      setUserNameToDelete(user.name);
      setIsDeleteModalOpen(true);
    }
  }, [users]);

  const handleUpdateRole = useCallback(async (userId: string, role: string) => {
    return await updateUserRole(userId, role);
  }, [updateUserRole]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    return await deleteUser(userId);
  }, [deleteUser]);

  const handleUpdateUser = useCallback(async (userId: string, updates: { name: string; role: string }) => {
    return await updateUser(userId, updates);
  }, [updateUser]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchUsers({
      page,
      limit: currentLimit,
      search: searchTerm,
    });
  }, [setCurrentPage, fetchUsers, currentLimit, searchTerm]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setCurrentLimit(pageSize);
    fetchUsers({
      page: 1,
      limit: pageSize,
      search: searchTerm,
    });
  }, [setCurrentLimit, fetchUsers, searchTerm]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    // Fetch users with the new search term
    fetchUsers({
      page: 1,
      limit: currentLimit,
      search: term,
    });
  }, [setSearchTerm, fetchUsers, currentLimit]);

  // Memoized stats to prevent unnecessary recalculations
  const stats = useMemo(() => {
    const adminUsers = users.filter(u => u.role === "admin").length;
    const premiumUsers = users.filter(u => u.role === "premium").length;
    const regularUsers = users.filter(u => u.role === "user").length;
    
    return {
      total: pagination.total,
      admin: adminUsers,
      premium: premiumUsers,
      regular: regularUsers,
    };
  }, [users, pagination.total]);

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-[#0e1924] tracking-tight">User Management</h1>
          <p className="mt-2 text-base text-gray-700 max-w-2xl">
            Manage user accounts, roles, and permissions.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">
              {stats.admin}
            </div>
            <p className="text-xs text-muted-foreground">Admin Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {stats.premium}
            </div>
            <p className="text-xs text-muted-foreground">Premium Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {stats.regular}
            </div>
            <p className="text-xs text-muted-foreground">Regular Users</p>
          </CardContent>
        </Card>
          </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Summary */}
      {!isLoading && (
        <div className="text-sm text-muted-foreground">
          Showing {users.length} of {pagination.total} users
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}

      {/* Users DataTable */}
      <UserDataTable
        users={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteClick}
        onUpdateRole={handleUpdateRole}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        currentUserId={session?.user?.id || ""}
      />

      {/* Edit User Modal */}
      <EditUserModal
        user={currentUser}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateUser}
        isLoading={isLoading}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        userId={userIdToDelete}
        userName={userNameToDelete}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        isLoading={isLoading}
      />
    </>
  );
}
