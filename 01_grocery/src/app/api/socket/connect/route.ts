import connectDB from "@/lib/db";
import User from "@/model/User.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req :NextRequest) {
    try {
        await connectDB();
        const { userId , socketId} = await req.json();
        const user=await User.findByIdAndUpdate(
            userId, {
            socketId,
            isOnline: true
        },
            { new: true }
        );
        if(!user)
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        return NextResponse.json({ message: "Socket id updated successfully", user }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Error updating socket id" }, { status: 500 });
    }
}
