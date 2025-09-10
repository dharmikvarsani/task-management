import { getUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createTaskSchema } from "@/lib/validation";
import { Task } from "@/model/task";
import { User } from "@/model/user";
import { NextResponse } from "next/server";

export const POST = async (req) => {
    try {
        await connectDB();
        const checkUser = await getUser(req);
        console.log("checkUser:", checkUser);
        if (!checkUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        let parsedData;
        try {
            parsedData = createTaskSchema.parse(body);
        } catch (err) {
            console.error(err);
            return NextResponse.json({ message: "Invalid data", errors: err.errors }, { status: 400 });
        }

        const { title, description = '', assignedTo, priority, assignedDate, targetDeliveryDate } = parsedData;

        const tl = await User.findById(assignedTo);
        if (!tl || tl.role !== 'tl') {
            return NextResponse.json({ message: "AssignedTo must be a team leader" }, { status: 400 });
        }

        const task = await Task.create({
            title,
            description,
            assignedBy: checkUser._id,
            assignedTo: tl._id,
            priority, 
            assignedDate: new Date(assignedDate),
            targetDeliveryDate: new Date(targetDeliveryDate),
            history: [{ action: 'created', from: checkUser._id, to: tl._id }]
        });

        return NextResponse.json({ message: "Task created successfully", id: task._id }, { status: 201 });
    } catch (error) {
        console.error("POST /api/task error:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
};


export const GET = async (req) => {
    try {
        await connectDB();
        const checkUser = await getUser(req);
        if (!checkUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const q = {};

        if (checkUser.role === "manager") {

        } else if (checkUser.role === "tl") {
            const developers = await User.find({ teamLead: checkUser._id }).select("_id");
            const devIds = developers.map((d) => d._id);

            q.$or = [{ assignedTo: checkUser._id }];
            if (devIds.length) {
                q.$or.push({ assignedTo: { $in: devIds } });
            }
        } else if (checkUser.role === "developer") {
            q.assignedTo = checkUser._id;
        }

        if (status) q.status = status;

        const tasks = await Task.find(q)
            .populate("assignedBy", "name role")
            .populate("assignedTo", "name role")
            .sort({ updatedAt: -1 });

        if (!tasks.length) {
            return NextResponse.json(
                { message: "No tasks assigned", out: [] },
                { status: 200 }
            );
        }

        const out = tasks.map((t) => ({
            _id: t._id,
            title: t.title,
            description: t.description,
            assignedByName: t.assignedBy?.name,
            assignedBy: t.assignedBy?.name,
            assigneeName: t.assignedTo?.name,
            assignedToName: t.assignedTo?.name,
            assigneeRole: t.assignedTo?.role,
            assignedDate: t.assignedDate,
            targetDeliveryDate: t.targetDeliveryDate,
            actualDeliveryDate: t.actualDeliveryDate,
            status: t.status,
            priority: t.priority,
            timeTakenDays: t.actualDeliveryDate
                ? Math.ceil(
                    (t.actualDeliveryDate - t.assignedDate) /
                    (1000 * 60 * 60 * 24)
                )
                : null,
        }));

        return NextResponse.json(
            { message: "Tasks fetched successfully", out },
            { status: 200 }
        );
    } catch (error) {
        console.error("GET /api/task error:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
