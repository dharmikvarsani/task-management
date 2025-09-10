import { getUser } from "@/lib/auth";
import { connectDB } from "@/lib/db"
import { requireRole } from "@/lib/roleBasedAuth";
import { User } from "@/model/user";
import bcrypt from "bcrypt"
import { NextResponse } from "next/server";


export const GET = async (req, { params }) => {
    try {
        await connectDB()
        const { id } = await params;
        const checkUser = await getUser();
        if (!checkUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        // Check user existence
        const user = await User.findById(id).select('-password');
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 })
        }

        // check role based access
        if (checkUser.role === 'tl') {
            if (checkUser._id.toString() !== user._id && checkUser.teamLead.toString() !== user._id) {
                return NextResponse.json({ message: "Forbidden" }, { status: 403 })
            }
        }

        if (checkUser.role === 'developer') {
            if (checkUser._id.toString() !== user._id) {
                return NextResponse.json({ message: "Forbidden" }, { status: 403 })
            }
        }

        return NextResponse.json({ message: "Get user successfully", user }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}


export const PUT = async (req, { params }) => {
    try {
        await connectDB()
        const { id } = await params;
        const checkUser = await getUser();
        if (!checkUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 })
        }

        if (checkUser.role === 'manager') {
            const { name, email, password, role, teamLead, isActive } = await req.json();

            if (name) user.name = name;

            if (email) {
                const emailExists = await User.findOne({ email });
                if (emailExists && emailExists._id.toString() !== user._id.toString()) {
                    return NextResponse.json({ message: "Email already in use" }, { status: 400 });
                }
                user.email = email;
            }

            if (typeof isActive === 'boolean') user.isActive = isActive;

            if (role && !['manager', 'tl', 'developer'].includes(role)) {
                return NextResponse.json({ message: "Invalid role", status: 400 });
            }

            if (role) user.role = role;

            if (role === 'developer') {
                if (!teamLead) {
                    return NextResponse.json({ message: "Team Leader is required for developer role" }, { status: 400 });
                }
                const tl = await User.findById(teamLead);
                if (!tl || tl.role !== 'tl') {
                    return NextResponse.json({ message: "Team Leader must have TL role", status: 400 });
                }
                user.teamLead = teamLead;
            } else {
                user.teamLead = undefined;
            }

            if (password) user.password = await bcrypt.hash(password, 10);

            await user.save();

            return NextResponse.json({
                message: "User updated successfully",
                user: { _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive }
            }, { status: 200 });
        }

    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}


export const DELETE = async (req, { params }) => {
    try {
        await connectDB();
        const { id } = await params;
        const checkUser = await getUser();
        if (!checkUser) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }
        requireRole(checkUser, ['manager']);

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}