import connectDB from "@/lib/db";
import User from "@/model/User.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { userId, location } = await req.json();
        if(!userId || !location) {
            return new Response("missing userId or location", { status: 400 });
        }
        const user = await User.findByIdAndUpdate(userId, { location }, { new: true });
        if(!user) {
            return new Response("User not found", { status: 404 });
        }
        return NextResponse.json({ message: "location updated successfully" }, { status: 200 });
    } catch (error) {
        return  NextResponse.json({ message: `Internal Server Error${error}` }, { status: 500 });
        
    }
}
