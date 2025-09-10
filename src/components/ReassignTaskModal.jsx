"use client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDevelopers } from "@/hooks/useDevelopers";
import { useState } from "react";
import { reassignTask } from "@/hooks/useTasks";

export default function ReassignTaskModal({ task, onReassign }) {
    const { developers, isLoading } = useDevelopers();
    const [open, setOpen] = useState(false);
    const [developerId, setDeveloperId] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!developerId) return alert("Select a developer");
        setLoading(true);
        try {
            await reassignTask(task._id, { developerId });
            setOpen(false);
            onReassign();
        } catch (error) {
            alert(error.response?.data?.message || "Error reassigning task");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button variant="outline" onClick={() => setOpen(true)}>Reassign</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reassign Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {isLoading ? (
                            <p>Loading developers...</p>
                        ) : (
                            <select
                                value={developerId}
                                onChange={(e) => setDeveloperId(e.target.value)}
                                className="w-full border p-2 rounded"
                            >
                                <option value="">Select Developer</option>
                                {developers.map((dev) => (
                                    <option key={dev._id} value={dev._id}>
                                        {dev.name} 
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSubmit} disabled={loading}>
                            {loading ? "Reassigning..." : "Reassign"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
