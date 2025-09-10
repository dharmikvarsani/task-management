import { getUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/roleBasedAuth";
import { statusSchema } from "@/lib/validation";
import { Task } from "@/model/task";
import { NextResponse } from "next/server";

export const PUT = async (req, { params }) => {
    try {
        await connectDB();
        const checkUser = await getUser(req);
        if (!checkUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        requireRole(checkUser, ['tl', 'developer']);
        const { id } = await params;
        const body = await req.json();
        const parsedData = statusSchema.safeParse(body);
        if (!parsedData.success) {
            return NextResponse.json({ message: "Invalid data" }, { status: 400 })
        }

        const task = await Task.findById(id)
        if (!task) {
            return NextResponse.json({ message: "Task not found" }, { status: 404 })
        }

        const prevStatus = task.status;
        task.status = parsedData.data.status;

        if (parsedData.data.status === 'Completed' && !task.actualDeliveryDate) {
            task.actualDeliveryDate = new Date();
        }


        task.history.push({
            action: 'status_changed', from: checkUser._id, to: task.assignee,
            note: `Status changed from ${prevStatus} to ${task.status}`
        })

        await task.save();
        return NextResponse.json({ message: "Task status updated successfully" }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}