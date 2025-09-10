'use client';
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import Link from "next/link";
import { useTasks, updateTaskStatus, deleteTask, reassignTask } from "@/hooks/useTasks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function TasksPage() {
  const [user, setUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modal, setModal] = useState({ open: false, message: "" });
  const [confirmModal, setConfirmModal] = useState({ open: false, taskId: null });
  const { tasks, isLoading, mutate } = useTasks();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setModal({ open: true, message: "Failed to fetch user" });
      }
    };
    fetchUser();
  }, []);

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskStatus(taskId, status);
      mutate();
    } catch (err) {
      setModal({ open: true, message: err.response?.data?.message || "Error updating status" });
    }
  };

  const handleDelete = async () => {
    const taskId = confirmModal.taskId;
    if (!taskId) return;

    setIsDeleting(true);
    try {
      await deleteTask(taskId);
      mutate();
      setModal({ open: true, message: "Task deleted successfully!" });
    } catch (err) {
      setModal({ open: true, message: err.response?.data?.message || "Error deleting task" });
    } finally {
      setIsDeleting(false);
      setConfirmModal({ open: false, taskId: null });
    }
  };

  const handleReassign = async (taskId) => {
    const devId = prompt("Enter developer ID to assign:");
    if (!devId) return;
    try {
      await reassignTask(taskId, devId);
      mutate();
      setModal({ open: true, message: "Task reassigned successfully!" });
    } catch (err) {
      setModal({ open: true, message: err.response?.data?.message || "Error reassigning task" });
    }
  };

  if (isLoading || !user) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
        <Link href="/tasks/new">
          <Button>Create New Task</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => (
          <Card key={task._id} className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle>{task.title}</CardTitle>
              <CardDescription>{task.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status:</span>
                <Select defaultValue={task.status} onValueChange={(val) => handleStatusChange(task._id, val)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="R&D Phase">R&D Phase</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p><span className="font-medium">Assigned To:</span> {task.assignedToName || "-"}</p>
              <p><span className="font-medium">Assigned By:</span> {task.assignedByName || "-"}</p>

              <div className="flex space-x-2 pt-2">
                <Link href={`/tasks/${task._id}`}>
                  <Button variant="outline" size="sm">View</Button>
                </Link>
                <Link href={`/tasks/new?id=${task._id}`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmModal({ open: true, taskId: task._id })}
                  disabled={isDeleting}
                >
                  Delete
                </Button>

                {user.role === "tl" && (
                  <Button size="sm" onClick={() => handleReassign(task._id)}>Reassign</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={confirmModal.open} onOpenChange={() => setConfirmModal({ open: false, taskId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="py-2">Are you sure you want to delete this task?</div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setConfirmModal({ open: false, taskId: null })}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Modal */}
      <Dialog open={modal.open} onOpenChange={() => setModal({ open: false, message: "" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification</DialogTitle>
          </DialogHeader>
          <div className="py-2">{modal.message}</div>
          <DialogFooter>
            <Button onClick={() => setModal({ open: false, message: "" })}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
