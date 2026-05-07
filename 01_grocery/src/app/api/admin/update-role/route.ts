import connectDB from "@/lib/db";
import User from "@/model/User.model";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const session = await auth();
        if (session?.user?.role !== "admin") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { userId, role } = await request.json();
        
        if (!["user", "admin", "deliveryBoy"].includes(role)) {
            return NextResponse.json({ message: "Invalid role" }, { status: 400 });
        }

        await User.findByIdAndUpdate(userId, { role });

        return NextResponse.json({ message: "User role updated successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
