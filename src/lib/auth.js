import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { connectDB } from "./db"
import { User } from "@/model/user"
import bcrypt from "bcrypt"


export const SignToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
}

export const getUser = async () => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return null;
        }
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null;
    }
}

export const isAuthenticated = async (email, password) => {
    await connectDB();
    const user = await User.findOne({ email })
    if (!user) return null;

    const isMatched = await bcrypt.compare(password, user.password)
    if (!isMatched) return null;

    return { _id: user._id.toString(), name: user.name, email: user.email, role: user.role };
}