"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, updates: { name: string; role: string }) => Promise<boolean>;
  isLoading?: boolean;
}

export function EditUserModal({
  user,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: EditUserModalProps) {
  const [editedUser, setEditedUser] = useState<{
    name: string;
    role: string;
  }>({ name: "", role: "user" });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name,
        role: user.role,
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    // Only update if there are actual changes
    if (
      editedUser.name === user.name &&
      editedUser.role === user.role
    ) {
      onClose();
      return;
    }

    const success = await onSave(user._id, editedUser);
    if (success) {
      onClose();
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (user) {
      setEditedUser({
        name: user.name,
        role: user.role,
      });
    }
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information. Email cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={editedUser.name}
              onChange={(e) =>
                setEditedUser((prev) => ({ ...prev, name: e.target.value }))
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={user.email}
              className="col-span-3"
              disabled
            />
            <p className="col-span-4 text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select
              value={editedUser.role}
              onValueChange={(value) =>
                setEditedUser((prev) => ({
                  ...prev,
                  role: value,
                }))
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 