"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TaskViewPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`/api/task/${params.id}`, { credentials: "include" });
        const data = await res.json();
        if (data.task) setTask(data.task);
        else alert("Task not found");
      } catch (err) {
        console.error(err);
        alert("Error fetching task");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [params.id]);

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!task) return <p className="text-center mt-20">Task not found</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{task.title}</h1>
        <div className="flex space-x-2">
          <Link href="/tasks">
            <Button variant="ghost" size="sm">Back</Button>
          </Link>
        </div>
      </div>

      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Description</CardTitle>
          <CardDescription>{task.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><span className="font-medium">Assigned To:</span> {task.assignedTo?.name || "-"}</p>
          <p><span className="font-medium">Assigned By:</span> {task.assignedBy?.name || "-"}</p>
          <p><span className="font-medium">Priority:</span> {task.priority}</p>
          <p><span className="font-medium">Status:</span> {task.status}</p>
          <p><span className="font-medium">Assigned Date:</span> {new Date(task.assignedDate).toLocaleDateString()}</p>
          <p><span className="font-medium">Target Delivery Date:</span> {new Date(task.targetDeliveryDate).toLocaleDateString()}</p>
          {task.actualDeliveryDate && (
            <p><span className="font-medium">Actual Delivery Date:</span> {new Date(task.actualDeliveryDate).toLocaleDateString()}</p>
          )}
        </CardContent>
      </Card>

      {/* Task History */}
      {task.history && task.history.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Task History</h2>
          {task.history.map((h, i) => (
            <Card key={i} className="border-gray-200 dark:border-gray-700">
              <CardContent>
                <p><span className="font-medium">Action:</span> {h.action}</p>
                {h.fromName && <p><span className="font-medium">From:</span> {h.fromName}</p>}
                {h.toName && <p><span className="font-medium">To:</span> {h.toName}</p>}
                {h.statusFrom && <p><span className="font-medium">Status From:</span> {h.statusFrom}</p>}
                {h.statusTo && <p><span className="font-medium">Status To:</span> {h.statusTo}</p>}
                {h.note && <p><span className="font-medium">Note:</span> {h.note}</p>}
                <p className="text-xs text-gray-500">{new Date(h.at).toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
