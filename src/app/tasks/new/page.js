'use client';
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

const taskSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  assignedTo: z.string().min(1),
  priority: z.enum(["High", "Medium", "Low"]),
  assignedDate: z.string().min(1),
  targetDeliveryDate: z.string().min(1),
});

export default function TaskFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("id"); // edit 
  const [teamLeads, setTeamLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, message: "" });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      assignedTo: "",
      priority: "Medium",
      assignedDate: new Date().toISOString().slice(0, 10),
      targetDeliveryDate: new Date().toISOString().slice(0, 10),
    },
  });

  const assignedToValue = watch("assignedTo");
  const priorityValue = watch("priority");

  // Fetch team leads
  useEffect(() => {
    axios.get("/api/auth/register?role=tl").then(res => setTeamLeads(res.data.users || []));
  }, []);

  // Fetch task if editing
  useEffect(() => {
    if (!taskId) return;
    setLoading(true);
    axios.get(`/api/task/${taskId}`, { withCredentials: true })
      .then(res => {
        const t = res.data.task;
        setValue("title", t.title);
        setValue("description", t.description);
        setValue("assignedTo", t.assignedTo?._id || "");
        setValue("priority", t.priority);
        setValue("assignedDate", new Date(t.assignedDate).toISOString().slice(0, 10));
        setValue("targetDeliveryDate", new Date(t.targetDeliveryDate).toISOString().slice(0, 10));
      })
      .catch(err => setModal({ open: true, message: "Failed to fetch task" }))
      .finally(() => setLoading(false));
  }, [taskId, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (taskId) {
        await axios.put(`/api/task/${taskId}`, data, { withCredentials: true });
        setModal({ open: true, message: "Task updated successfully!" });
      } else {
        await axios.post("/api/task", data, { withCredentials: true });
        setModal({ open: true, message: "Task created successfully!" });
      }
    } catch (err) {
      setModal({ open: true, message: err.response?.data?.message || "Error submitting task" });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModal({ open: false, message: "" });
    router.push("/tasks");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{taskId ? "Edit Task" : "Create Task"}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Label>Title</Label>
        <Input {...register("title")} placeholder="Task title" />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}

        <Label>Description</Label>
        <Textarea {...register("description")} placeholder="Task description" />
        {errors.description && <p className="text-red-500">{errors.description.message}</p>}

        <Label>Assign To</Label>
        <Select value={assignedToValue} onValueChange={(val) => setValue("assignedTo", val)}>
          <SelectTrigger><SelectValue placeholder="Select Team Leader" /></SelectTrigger>
          <SelectContent>
            {teamLeads.map(tl => <SelectItem key={tl._id} value={tl._id}>{tl.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.assignedTo && <p className="text-red-500">{errors.assignedTo.message}</p>}

        <Label>Priority</Label>
        <Select value={priorityValue} onValueChange={(val) => setValue("priority", val)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>

        <Label>Assigned Date</Label>
        <Input type="date" {...register("assignedDate")} />

        <Label>Target Delivery Date</Label>
        <Input type="date" {...register("targetDeliveryDate")} />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (taskId ? "Updating..." : "Creating...") : (taskId ? "Update Task" : "Create Task")}
        </Button>
      </form>

      {/* Modal */}
      <Dialog open={modal.open} onOpenChange={handleModalClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {modal.message}
          </div>
          <DialogFooter>
            <Button onClick={handleModalClose}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
