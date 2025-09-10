import { NextResponse } from "next/server";
import { isAuthenticated, SignToken } from "@/lib/auth";
import { cookies } from "next/headers";

export const POST = async (req) => {
    try {
        const { email, password } = await req.json();
        const user = await isAuthenticated(email, password);

        if (!user) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        const token = SignToken(user);

        cookies().set("token", token, {
            httpOnly: true,
            path: "/",
            maxAge: 7 * 24 * 60 * 60,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        return NextResponse.json({ message: "Login successful", user });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
};
