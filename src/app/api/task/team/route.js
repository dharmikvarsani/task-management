import { getUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/model/user";
import { NextResponse } from "next/server";

export const GET = async (req) => {
    try {
        await connectDB();
        const checkUser = await getUser(req);
        if (!checkUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        let team = [];

        if (checkUser.role === "tl") {
            team = await User.find({ teamLead: checkUser._id })
                .select("_id name email role");
        }

        else if (checkUser.role === "developer") {
            const dev = await User.findById(checkUser._id).populate("teamLead", "name email role");
            if (dev?.teamLead) {
                const otherDevs = await User.find({ teamLead: dev.teamLead._id })
                    .select("_id name email role");
                team = [dev.teamLead, ...otherDevs];
            }
        }

        else if (checkUser.role === "manager") {
            team = await User.find()
                .select("_id name email role");
        }

        return NextResponse.json({ team }, { status: 200 });
    } catch (error) {
        console.error("GET /api/task/team error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
};
