import { getUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/roleBasedAuth";
import { Task } from "@/model/task";
import { NextResponse } from "next/server";

export const PUT = async (req, { params }) => {
    try {
        await connectDB();
        const checkUser = await getUser(req);
        if (!checkUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        requireRole(checkUser, ["manager"]);

        const { id } = await params;
        const body = await req.json();

        const task = await Task.findById(id);
        if (!task) return NextResponse.json({ message: "Task not found" }, { status: 404 });

        const fields = ["title", "description", "priority", "assignedDate", "targetDeliveryDate", "status"];
        fields.forEach(f => {
            if (body[f] !== undefined) task[f] = body[f];
        });

        task.history.push({
            action: "updated",
            from: checkUser._id,
            note: "Task updated by manager"
        });

        await task.save();
        return NextResponse.json({ message: "Task updated successfully", task }, { status: 200 });
    } catch (err) {
        console.error("PUT /task/[id] error:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
};

export const DELETE = async (req, { params }) => {
    try {
        await connectDB();
        const checkUser = await getUser(req);
        if (!checkUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        requireRole(checkUser, ["manager"]);
        const { id } = await params;
        const task = await Task.findById(id);
        if (!task) return NextResponse.json({ message: "Task not found" }, { status: 404 });

        await task.deleteOne();
        return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
    } catch (err) {
        console.error("DELETE /task/[id] error:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
};

export const GET = async (req, { params }) => {
    try {
        await connectDB();
        const checkUser = await getUser(req);
        if (!checkUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const task = await Task.findById(id)
            .populate("assignedBy", "name role")
            .populate("assignedTo", "name role");

        if (!task) return NextResponse.json({ message: "Task not found" }, { status: 404 });

        return NextResponse.json({ task }, { status: 200 });
    } catch (err) {
        console.error("GET /task/[id] error:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
};
