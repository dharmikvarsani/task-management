"use client";

import { useUsers, deleteUser } from "@/hooks/useUsers";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function UsersPage() {
  const { users, isLoading, mutate } = useUsers();
  const [deleting, setDeleting] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, userId: null });

  if (isLoading) return <p className="text-center py-10">Loading users...</p>;

  const handleDelete = async () => {
    setDeleting(confirmModal.userId);
    try {
      await deleteUser(confirmModal.userId);
      mutate();
      setConfirmModal({ open: false, userId: null });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">All Users</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u._id}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3 flex justify-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setConfirmModal({ open: true, userId: u._id })}
                    disabled={deleting === u._id}
                  >
                    {deleting === u._id ? "Deleting..." : "Delete"}
                  </Button>
                  <Link href={`/users/${u._id}/edit`}>
                    <Button size="sm">Edit</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={confirmModal.open} onOpenChange={() => setConfirmModal({ open: false, userId: null })}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmModal({ open: false, userId: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
