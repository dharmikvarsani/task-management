import { NextResponse } from "next/server"

export const requireRole = (user, roles) => {
    if (!user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    if (!roles.includes(user.role)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

}