import { getUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/roleBasedAuth";
import { reassignSchema } from "@/lib/validation";
import { Task } from "@/model/task";
import { User } from "@/model/user";
import { NextResponse } from "next/server";

export const PUT = async (req, { params }) => {
    try {
        await connectDB();
        const checkUser = await getUser(req);
        if (!checkUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        requireRole(checkUser, ["tl"]);

        const { id } = await params;
        const body = await req.json();
        const parsedData = reassignSchema.safeParse(body);
        if (!parsedData.success) return NextResponse.json({ message: "Invalid data" }, { status: 400 });

        const task = await Task.findById(id);
        if (!task) return NextResponse.json({ message: "Task not found" }, { status: 404 });

        if (task.assignedTo.toString() !== checkUser._id.toString()) {
            return NextResponse.json({ message: "You are not authorized to reassign this task" }, { status: 403 });
        }

        const developer = await User.findById(parsedData.data.developerId);
        if (!developer || developer.role !== "developer" || developer.teamLead.toString() !== checkUser._id.toString()) {
            return NextResponse.json({ message: "Invalid developer" }, { status: 400 });
        }

        task.history.push({
            action: "reassigned",
            from: checkUser._id,
            to: developer._id,
            note: "TL reassigned task to developer",
        });

        task.assignedTo = developer._id;
        await task.save();

        return NextResponse.json({ message: "Task reassigned successfully" }, { status: 200 });
    } catch (error) {
        console.error("PUT /task/:id/reassign error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
};
