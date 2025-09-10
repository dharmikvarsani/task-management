import { getUser } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import { requireRole } from "@/lib/roleBasedAuth"
import { User } from "@/model/user"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"


export const GET = async (req) => {
    try {
        await connectDB()

        const findUser = await getUser()
        if (!findUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const roleCheck = requireRole(findUser, ["manager"]);
        if (roleCheck) return roleCheck;

        const url = new URL(req.url);
        const roleFilter = url.searchParams.get("role"); 

        let query = {};
        if (roleFilter) {
            query.role = roleFilter; 
        }

        const users = await User.find(query).select("-password")
        return NextResponse.json({ message: "Get all users successfully", users }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}


export const POST = async (req) => {
    try {
        await connectDB();
        const checkUser = await getUser();
        if (!checkUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const roleCheck = requireRole(checkUser, ["manager"]);
        if (roleCheck) return roleCheck;

        const { name, email, password, role, teamLead } = await req.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 })
        }

        if (!['manager', 'tl', 'developer'].includes(role)) {
            return NextResponse.json({ message: "Invalid role" }, { status: 400 })
        }

        if (role === 'developer') {
            if (!teamLead) {
                return NextResponse.json({ message: "Team Leader is required for developer role" }, { status: 400 })
            }
            const tl = await User.findById(teamLead);
            if (!tl || tl.role !== 'tl') {
                return NextResponse.json({ message: "Team Leader must be have temleader role" }, { status: 400 })
            }
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return NextResponse.json({ message: "User already exists" }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            teamLead: role === 'developer' ? teamLead : null
        });

        return NextResponse.json({
            message: "User registered successfully",
            user: { _id: newUser._id, name: newUser.name, role: newUser.role }
        }, { status: 201 })


    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}