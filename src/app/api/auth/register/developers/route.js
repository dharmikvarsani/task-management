import { getUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/model/user";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await connectDB();
    const checkUser = await getUser(req);

    if (!checkUser || checkUser.role !== "tl") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const developers = await User.find({ teamLead: checkUser._id, role: "developer" })
      .select("_id name email");

    return NextResponse.json({ users: developers }, { status: 200 });
  } catch (error) {
    console.error("GET /developers error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
};
